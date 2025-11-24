import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolePermissionService } from './role-permission.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  // ========== Role Endpoints ==========

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: Role,
  })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolePermissionService.createRole(createRoleDto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of roles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Role' } },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async findAllRoles(
    @Query() getRolesDto: GetRolesDto,
  ): Promise<PaginatedResponse<Role>> {
    return this.rolePermissionService.findAllRoles(getRolesDto);
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: Role,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOneRole(@Param('id') id: string) {
    return this.rolePermissionService.findOneRole(id);
  }

  @Patch('roles/:id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: Role,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolePermissionService.updateRole(id, updateRoleDto);
  }

  @Put('roles/:id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
    type: Role,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rolePermissionService.assignPermissionsToRole(id, assignPermissionsDto);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system role or role with users' })
  async removeRole(@Param('id') id: string) {
    return this.rolePermissionService.removeRole(id);
  }

  // ========== Permission Endpoints ==========

  @Post('permissions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: Permission,
  })
  @ApiResponse({ status: 409, description: 'Permission already exists' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rolePermissionService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Permission' },
        },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async findAllPermissions(
    @Query() getPermissionsDto: GetPermissionsDto,
  ): Promise<PaginatedResponse<Permission>> {
    return this.rolePermissionService.findAllPermissions(getPermissionsDto);
  }

  @Get('permissions/:id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: Permission,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOnePermission(@Param('id') id: string) {
    return this.rolePermissionService.findOnePermission(id);
  }

  @Patch('permissions/:id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: Permission,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rolePermissionService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete permission assigned to roles' })
  async removePermission(@Param('id') id: string) {
    return this.rolePermissionService.removePermission(id);
  }
}
