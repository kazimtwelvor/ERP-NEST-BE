import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { ROLE_PERMISSION_MESSAGES } from './messages/role-permission.messages';

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

  async findAllRoles(): Promise<{ roles: Role[]; message: string }> {
    const roles = await this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });

    return {
      roles,
      message: ROLE_PERMISSION_MESSAGES.ROLES_FETCHED,
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

    Object.assign(role, updateRoleDto);
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

  async findAllPermissions(): Promise<{ permissions: Permission[]; message: string }> {
    const permissions = await this.permissionRepository.find({
      order: { module: 'ASC', action: 'ASC' },
    });

    return {
      permissions,
      message: ROLE_PERMISSION_MESSAGES.PERMISSIONS_FETCHED,
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
