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
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { ROLE_PERMISSION_MESSAGES } from './messages/role-permission.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
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
    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id: savedRole.id },
      relations: ['permissions'],
    });

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
      .leftJoinAndSelect('role.permissions', 'permissions');

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
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND);
    }

    return {
      role,
      message: ROLE_PERMISSION_MESSAGES.ROLE_FETCHED,
    };
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
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

    const { permissionIds, ...updateData } = updateRoleDto;
    Object.assign(role, updateData);
    const updatedRole = await this.roleRepository.save(role);
    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id: updatedRole.id },
      relations: ['permissions'],
    });

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
      relations: ['permissions'],
    });

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
}
