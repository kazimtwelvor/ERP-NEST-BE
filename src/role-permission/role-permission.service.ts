import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { OrderStatus } from '../order-tracking/entities/order-status.entity';
import { RoleVisibility } from './entities/role-visibility.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignOrderStatusesDto } from './dto/assign-order-statuses.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignRoleVisibilitiesDto } from './dto/assign-role-visibilities.dto';
import { UpdateRoleVisibilityDto } from './dto/update-role-visibility.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { ROLE_PERMISSION_MESSAGES } from './messages/role-permission.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';
import { DepartmentStatus } from '../order-tracking/enums/department-status.enum';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(RoleVisibility)
    private readonly roleVisibilityRepository: Repository<RoleVisibility>,
  ) {}


  async createRole(createRoleDto: CreateRoleDto): Promise<{ role: Role; message: string }> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(ROLE_PERMISSION_MESSAGES.ROLE_ALREADY_EXISTS);
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      status: createRoleDto.status || 'active',
    });

    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissionIds),
      });
      role.permissions = permissions;
    }

    const savedRole = await this.roleRepository.save(role);

    // Handle order statuses if provided
    if (createRoleDto.orderStatuses && createRoleDto.orderStatuses.length > 0) {
      const orderStatuses = createRoleDto.orderStatuses.map((statusDto) =>
        this.orderStatusRepository.create({
          roleId: savedRole.id,
          status: statusDto.status,
          displayOrder: statusDto.displayOrder ?? 0,
          isActive: statusDto.isActive ?? true,
        }),
      );
      await this.orderStatusRepository.save(orderStatuses);
    }

    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id: savedRole.id },
      relations: ['permissions', 'orderStatuses'],
    });

    // Sort orderStatuses by displayOrder if they exist
    if (roleWithPermissions?.orderStatuses) {
      roleWithPermissions.orderStatuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      role: roleWithPermissions!,
      message: ROLE_PERMISSION_MESSAGES.ROLE_CREATED,
    };
  }

  async findAllRoles(getRolesDto: GetRolesDto): Promise<PaginatedResponse<Role>> {
    const {
      query,
      page = 1,
      limit,
      status,
      isSystem,
      sort = SortEnum.DESC,
    } = getRolesDto;

    const qb = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.orderStatuses', 'orderStatuses')
      .leftJoinAndSelect('role.roleVisibilities', 'roleVisibilities')
      .leftJoinAndSelect('roleVisibilities.visibleRole', 'visibleRole')
      .addOrderBy('orderStatuses.displayOrder', 'ASC')
      .addOrderBy('orderStatuses.createdAt', 'ASC')
      .addOrderBy('roleVisibilities.displayOrder', 'ASC')
      .addOrderBy('roleVisibilities.createdAt', 'ASC');

    // Search query
    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(role.name) LIKE LOWER(:query)', {
            query: `%${query}%`,
          })
            .orWhere('LOWER(role.displayName) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(role.description) LIKE LOWER(:query)', {
              query: `%${query}%`,
            });
        }),
      );
    }

    // Filters
    if (status) {
      qb.andWhere('role.status = :status', { status });
    }

    if (isSystem !== undefined) {
      qb.andWhere('role.is_system = :isSystem', {
        isSystem: isSystem === 'true',
      });
    }

    // Sorting
    qb.orderBy('role.createdAt', sort);

    // Pagination - only apply if limit is provided
    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [roles, total] = await qb.getManyAndCount();
    
    // Sort orderStatuses and roleVisibilities by displayOrder for each role
    roles.forEach((role) => {
      if (role.orderStatuses) {
        role.orderStatuses.sort((a, b) => a.displayOrder - b.displayOrder);
      }
      if (role.roleVisibilities) {
        role.roleVisibilities.sort((a, b) => a.displayOrder - b.displayOrder);
      }
    });

    const lastPage = limit ? Math.ceil(total / limit) : 1;

    return {
      message: ROLE_PERMISSION_MESSAGES.ROLES_FETCHED,
      data: roles,
      page,
      total,
      lastPage,
    };
  }

  async findOneRole(id: string): Promise<{ role: Role; message: string }> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users', 'orderStatuses', 'roleVisibilities', 'roleVisibilities.visibleRole'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    // Sort orderStatuses and roleVisibilities by displayOrder if they exist
    if (role.orderStatuses) {
      role.orderStatuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }
    if (role.roleVisibilities) {
      role.roleVisibilities.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      role,
      message: ROLE_PERMISSION_MESSAGES.ROLE_FETCHED,
    };
  }

  async findRoleByName(name: string): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions', 'orderStatuses'],
    });

    // Sort orderStatuses by displayOrder if they exist
    if (role?.orderStatuses) {
      role.orderStatuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return role;
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<{ role: Role; message: string }> {
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      throw new BadRequestException('Invalid role ID');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid role ID format. Must be a valid UUID.');
    }

    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException(ROLE_PERMISSION_MESSAGES.ROLE_ALREADY_EXISTS);
      }
    }

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.findBy({
        id: In(updateRoleDto.permissionIds),
      });
      role.permissions = permissions;
    }

    // Handle order statuses if provided
    if (updateRoleDto.orderStatuses !== undefined) {
      // Remove existing order statuses
      const existingStatuses = await this.orderStatusRepository.find({
        where: { roleId: id },
      });
      if (existingStatuses.length > 0) {
        await this.orderStatusRepository.remove(existingStatuses);
      }

      // Create new order statuses if provided
      if (updateRoleDto.orderStatuses.length > 0) {
        const orderStatuses = updateRoleDto.orderStatuses.map((statusDto) =>
          this.orderStatusRepository.create({
            roleId: id,
            status: statusDto.status,
            displayOrder: statusDto.displayOrder ?? 0,
            isActive: statusDto.isActive ?? true,
          }),
        );
        await this.orderStatusRepository.save(orderStatuses);
      }
    }

    const { permissionIds, orderStatuses, ...updateData } = updateRoleDto;
    Object.assign(role, updateData);
    const updatedRole = await this.roleRepository.save(role);
    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id: updatedRole.id },
      relations: ['permissions', 'orderStatuses'],
    });

    // Sort orderStatuses by displayOrder if they exist
    if (roleWithPermissions?.orderStatuses) {
      roleWithPermissions.orderStatuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      role: roleWithPermissions!,
      message: ROLE_PERMISSION_MESSAGES.ROLE_UPDATED,
    };
  }

  async assignPermissionsToRole(
    id: string,
    assignPermissionsDto: AssignPermissionsDto,
  ): Promise<{ role: Role; message: string }> {
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      throw new BadRequestException('Invalid role ID');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid role ID format. Must be a valid UUID.');
    }

    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    const permissions = await this.permissionRepository.findBy({
      id: In(assignPermissionsDto.permissionIds),
    });

    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    role.permissions = permissions;
    await this.roleRepository.save(role);

    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'orderStatuses'],
    });

    // Sort orderStatuses by displayOrder if they exist
    if (roleWithPermissions?.orderStatuses) {
      roleWithPermissions.orderStatuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      role: roleWithPermissions!,
      message: ROLE_PERMISSION_MESSAGES.PERMISSIONS_ASSIGNED,
    };
  }

  async removeRole(id: string): Promise<{ message: string }> {
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      throw new BadRequestException('Invalid role ID');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid role ID format. Must be a valid UUID.');
    }

    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    if (role.isSystem) {
      throw new BadRequestException(ROLE_PERMISSION_MESSAGES.ROLE_SYSTEM_CANNOT_DELETE);
    }

    if (role.users && role.users.length > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    await this.roleRepository.remove(role);

    return {
      message: ROLE_PERMISSION_MESSAGES.ROLE_DELETED,
    };
  }


  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<{ permission: Permission; message: string }> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new ConflictException(ROLE_PERMISSION_MESSAGES.PERMISSION_ALREADY_EXISTS);
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);

    return {
      permission: savedPermission,
      message: ROLE_PERMISSION_MESSAGES.PERMISSION_CREATED,
    };
  }

  async findAllPermissions(
    getPermissionsDto: GetPermissionsDto,
  ): Promise<PaginatedResponse<Permission>> {
    const {
      query,
      page = 1,
      limit,
      module,
      action,
      sort = SortEnum.DESC,
    } = getPermissionsDto;

    const qb = this.permissionRepository.createQueryBuilder('permission');

    // Search query
    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(permission.name) LIKE LOWER(:query)', {
            query: `%${query}%`,
          })
            .orWhere('LOWER(permission.displayName) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(permission.description) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(permission.module) LIKE LOWER(:query)', {
              query: `%${query}%`,
            });
        }),
      );
    }

    // Filters
    if (module) {
      qb.andWhere('permission.module = :module', { module });
    }

    if (action) {
      qb.andWhere('permission.action = :action', { action });
    }

    // Sorting
    qb.orderBy('permission.createdAt', sort);

    // Pagination - only apply if limit is provided
    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [permissions, total] = await qb.getManyAndCount();
    const lastPage = limit ? Math.ceil(total / limit) : 1;

    return {
      message: ROLE_PERMISSION_MESSAGES.PERMISSIONS_FETCHED,
      data: permissions,
      page,
      total,
      lastPage,
    };
  }

  async findPermissionsByModule(module: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { module },
      order: { action: 'ASC' },
    });
  }

  async findOnePermission(id: string): Promise<{ permission: Permission; message: string }> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.PERMISSION_NOT_FOUND);
    }

    return {
      permission,
      message: ROLE_PERMISSION_MESSAGES.PERMISSION_FETCHED,
    };
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<{ permission: Permission; message: string }> {
    const permission = await this.permissionRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.PERMISSION_NOT_FOUND);
    }

    // Check if name is being updated and if it already exists
    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updatePermissionDto.name },
      });

      if (existingPermission) {
        throw new ConflictException(ROLE_PERMISSION_MESSAGES.PERMISSION_ALREADY_EXISTS);
      }
    }

    Object.assign(permission, updatePermissionDto);
    const updatedPermission = await this.permissionRepository.save(permission);

    return {
      permission: updatedPermission,
      message: ROLE_PERMISSION_MESSAGES.PERMISSION_UPDATED,
    };
  }

  async removePermission(id: string): Promise<{ message: string }> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.PERMISSION_NOT_FOUND);
    }

    if (permission.roles && permission.roles.length > 0) {
      throw new BadRequestException('Cannot delete permission that is assigned to roles');
    }

    await this.permissionRepository.remove(permission);

    return {
      message: ROLE_PERMISSION_MESSAGES.PERMISSION_DELETED,
    };
  }

  // ========== Order Status Management ==========

  /**
   * Assign order statuses to a role
   */
  async assignOrderStatuses(
    roleId: string,
    assignStatusesDto: AssignOrderStatusesDto,
  ): Promise<{ role: Role; message: string }> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['orderStatuses'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    // Remove existing statuses
    if (role.orderStatuses && role.orderStatuses.length > 0) {
      await this.orderStatusRepository.remove(role.orderStatuses);
    }

    // Create new statuses
    const statuses = assignStatusesDto.statuses.map((statusDto) =>
      this.orderStatusRepository.create({
        roleId,
        status: statusDto.status,
        displayOrder: statusDto.displayOrder ?? 0,
        isActive: statusDto.isActive ?? true,
      }),
    );

    await this.orderStatusRepository.save(statuses);

    // Return role with updated statuses
    const updatedRole = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['orderStatuses', 'permissions'],
    });

    // Sort statuses by displayOrder if they exist
    if (updatedRole?.orderStatuses) {
      updatedRole.orderStatuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      role: updatedRole!,
      message: 'Order statuses assigned successfully',
    };
  }

  /**
   * Get all order statuses for a role
   */
  async getRoleOrderStatuses(roleId: string): Promise<{
    statuses: OrderStatus[];
    message: string;
  }> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    const statuses = await this.orderStatusRepository.find({
      where: { roleId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });

    return {
      statuses,
      message: 'Order statuses retrieved successfully',
    };
  }

  /**
   * Update a specific order status
   */
  async updateOrderStatus(
    roleId: string,
    status: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<{ status: OrderStatus; message: string }> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: { roleId, status },
    });

    if (!orderStatus) {
      throw new NotFoundException('Order status not found');
    }

    if (updateDto.displayOrder !== undefined) {
      orderStatus.displayOrder = updateDto.displayOrder;
    }
    if (updateDto.isActive !== undefined) {
      orderStatus.isActive = updateDto.isActive;
    }

    const updated = await this.orderStatusRepository.save(orderStatus);

    return {
      status: updated,
      message: 'Order status updated successfully',
    };
  }

  /**
   * Remove a status from a role
   */
  async removeOrderStatus(
    roleId: string,
    status: string,
  ): Promise<{ message: string }> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: { roleId, status },
    });

    if (!orderStatus) {
      throw new NotFoundException('Order status not found');
    }

    await this.orderStatusRepository.remove(orderStatus);

    return {
      message: 'Order status removed successfully',
    };
  }

  /**
   * Get available order statuses for a role (for validation)
   */
  async getAvailableStatusesForRole(roleId: string): Promise<string[]> {
    const statuses = await this.orderStatusRepository.find({
      where: { roleId, isActive: true },
      order: { displayOrder: 'ASC' },
    });

    return statuses.map((s) => s.status);
  }

  /**
   * Check if a status is valid for a role
   */
  async isStatusValidForRole(
    roleId: string,
    status: string,
  ): Promise<boolean> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: { roleId, status, isActive: true },
    });

    return !!orderStatus;
  }

  /**
   * Get all available order statuses from enum (for dropdown)
   */
  async getAvailableOrderStatuses(): Promise<{
    statuses: Array<{ value: string; label: string }>;
    message: string;
  }> {
    const statuses = Object.values(DepartmentStatus).map((status) => {
      // Convert snake_case to Title Case for display
      const label = status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return {
        value: status,
        label,
      };
    });

    return {
      statuses,
      message: 'Available order statuses retrieved successfully',
    };
  }

  // ========== Role Visibility Management ==========

  /**
   * Assign role visibilities to a role
   */
  async assignRoleVisibilities(
    roleId: string,
    assignVisibilitiesDto: AssignRoleVisibilitiesDto,
  ): Promise<{ role: Role; message: string }> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['roleVisibilities'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    // Validate that all visible role IDs exist
    const visibleRoleIds = assignVisibilitiesDto.roleVisibilities.map(
      (v) => v.visibleRoleId,
    );
    const existingRoles = await this.roleRepository.find({
      where: { id: In(visibleRoleIds) },
    });

    if (existingRoles.length !== visibleRoleIds.length) {
      const foundIds = existingRoles.map((r) => r.id);
      const missingIds = visibleRoleIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Roles not found: ${missingIds.join(', ')}`,
      );
    }

    // Remove existing visibilities
    if (role.roleVisibilities && role.roleVisibilities.length > 0) {
      await this.roleVisibilityRepository.remove(role.roleVisibilities);
    }

    // Create new visibilities
    const visibilities = assignVisibilitiesDto.roleVisibilities.map((visibilityDto) =>
      this.roleVisibilityRepository.create({
        roleId,
        visibleRoleId: visibilityDto.visibleRoleId,
        displayOrder: visibilityDto.displayOrder ?? 0,
        isActive: visibilityDto.isActive ?? true,
      }),
    );

    await this.roleVisibilityRepository.save(visibilities);

    // Return role with updated visibilities
    const updatedRole = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['roleVisibilities', 'permissions'],
    });

    // Sort visibilities by displayOrder if they exist
    if (updatedRole?.roleVisibilities) {
      updatedRole.roleVisibilities.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      role: updatedRole!,
      message: 'Role visibilities assigned successfully',
    };
  }

  /**
   * Get all role visibilities for a role
   */
  async getRoleVisibilities(roleId: string): Promise<{
    visibilities: RoleVisibility[];
    message: string;
  }> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    const visibilities = await this.roleVisibilityRepository.find({
      where: { roleId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
      relations: ['role', 'visibleRole'],
    });

    return {
      visibilities,
      message: 'Role visibilities retrieved successfully',
    };
  }

  /**
   * Update a specific role visibility
   */
  async updateRoleVisibility(
    roleId: string,
    visibleRoleId: string,
    updateDto: UpdateRoleVisibilityDto,
  ): Promise<{ visibility: RoleVisibility; message: string }> {
    const roleVisibility = await this.roleVisibilityRepository.findOne({
      where: { roleId, visibleRoleId },
    });

    if (!roleVisibility) {
      throw new NotFoundException('Role visibility not found');
    }

    if (updateDto.displayOrder !== undefined) {
      roleVisibility.displayOrder = updateDto.displayOrder;
    }
    if (updateDto.isActive !== undefined) {
      roleVisibility.isActive = updateDto.isActive;
    }

    const updated = await this.roleVisibilityRepository.save(roleVisibility);

    return {
      visibility: updated,
      message: 'Role visibility updated successfully',
    };
  }

  /**
   * Remove a role visibility from a role
   */
  async removeRoleVisibility(
    roleId: string,
    visibleRoleId: string,
  ): Promise<{ message: string }> {
    const roleVisibility = await this.roleVisibilityRepository.findOne({
      where: { roleId, visibleRoleId },
    });

    if (!roleVisibility) {
      throw new NotFoundException('Role visibility not found');
    }

    await this.roleVisibilityRepository.remove(roleVisibility);

    return {
      message: 'Role visibility removed successfully',
    };
  }

  /**
   * Get visible roles for a role (returns role IDs that are visible)
   */
  async getVisibleRoleIds(roleId: string): Promise<string[]> {
    const visibilities = await this.roleVisibilityRepository.find({
      where: { roleId, isActive: true },
      order: { displayOrder: 'ASC' },
    });

    return visibilities.map((v) => v.visibleRoleId);
  }

  /**
   * Check if a role is visible to another role
   */
  async isRoleVisible(
    roleId: string,
    visibleRoleId: string,
  ): Promise<boolean> {
    const roleVisibility = await this.roleVisibilityRepository.findOne({
      where: { roleId, visibleRoleId, isActive: true },
    });

    return !!roleVisibility;
  }
}
