import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
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
import { AssignOrderStatusesDto } from './dto/assign-order-statuses.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignRoleVisibilitiesDto } from './dto/assign-role-visibilities.dto';
import { UpdateRoleVisibilityDto } from './dto/update-role-visibility.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { GetPermissionsDto } from './dto/get-permissions.dto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { OrderStatus } from '../order-tracking/entities/order-status.entity';
import { RoleVisibility } from './entities/role-visibility.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('role-permission')
export class RolePermissionController {
  
  constructor(private readonly rolePermissionService: RolePermissionService) {}

 
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
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of roles retrieved successfully',
    type: [Role],
  })
  async findAllRoles(@Query() getRolesDto: GetRolesDto) {
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

  @Post('roles/:id/permissions')
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
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully',
    type: [Permission],
  })
  async findAllPermissions(@Query() getPermissionsDto: GetPermissionsDto) {
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

  // ========== Order Status Management Endpoints ==========

  @Post('roles/:id/order-statuses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign order statuses to a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order statuses assigned successfully',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async assignOrderStatuses(
    @Param('id') id: string,
    @Body() assignStatusesDto: AssignOrderStatusesDto,
  ) {
    return this.rolePermissionService.assignOrderStatuses(id, assignStatusesDto);
  }

  @Get('roles/:id/order-statuses')
  @ApiOperation({ summary: 'Get all order statuses for a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order statuses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        statuses: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderStatus' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async getRoleOrderStatuses(@Param('id') id: string) {
    return this.rolePermissionService.getRoleOrderStatuses(id);
  }

  @Patch('roles/:id/order-statuses/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a specific order status' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiParam({ name: 'status', description: 'Status value' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderStatus,
  })
  @ApiResponse({
    status: 404,
    description: 'Role or status not found',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.rolePermissionService.updateOrderStatus(id, status, updateDto);
  }

  @Delete('roles/:id/order-statuses/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an order status from a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiParam({ name: 'status', description: 'Status value' })
  @ApiResponse({
    status: 200,
    description: 'Order status removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Role or status not found',
  })
  async removeOrderStatus(
    @Param('id') id: string,
    @Param('status') status: string,
  ) {
    return this.rolePermissionService.removeOrderStatus(id, status);
  }

  @Get('order-statuses/available')
  @ApiOperation({ summary: 'Get all available order statuses from enum (for dropdown)' })
  @ApiResponse({
    status: 200,
    description: 'Available order statuses retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        statuses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', description: 'Status enum value' },
              label: { type: 'string', description: 'Human-readable label' },
            },
          },
        },
      },
    },
  })
  async getAvailableOrderStatuses() {
    return this.rolePermissionService.getAvailableOrderStatuses();
  }

  // ========== Role Visibility Management Endpoints ==========

  @Post('roles/:id/role-visibilities')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role visibilities to a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Role visibilities assigned successfully',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found or visible roles not found',
  })
  async assignRoleVisibilities(
    @Param('id') id: string,
    @Body() assignVisibilitiesDto: AssignRoleVisibilitiesDto,
  ) {
    return this.rolePermissionService.assignRoleVisibilities(id, assignVisibilitiesDto);
  }

  @Get('roles/:id/role-visibilities')
  @ApiOperation({ summary: 'Get all role visibilities for a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Role visibilities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        visibilities: {
          type: 'array',
          items: { $ref: '#/components/schemas/RoleVisibility' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async getRoleVisibilities(@Param('id') id: string) {
    return this.rolePermissionService.getRoleVisibilities(id);
  }

  @Patch('roles/:id/role-visibilities/:visibleRoleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a specific role visibility' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiParam({ name: 'visibleRoleId', description: 'Visible Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Role visibility updated successfully',
    type: RoleVisibility,
  })
  @ApiResponse({
    status: 404,
    description: 'Role or visibility not found',
  })
  async updateRoleVisibility(
    @Param('id') id: string,
    @Param('visibleRoleId') visibleRoleId: string,
    @Body() updateDto: UpdateRoleVisibilityDto,
  ) {
    return this.rolePermissionService.updateRoleVisibility(id, visibleRoleId, updateDto);
  }

  @Delete('roles/:id/role-visibilities/:visibleRoleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a role visibility from a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiParam({ name: 'visibleRoleId', description: 'Visible Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Role visibility removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Role or visibility not found',
  })
  async removeRoleVisibility(
    @Param('id') id: string,
    @Param('visibleRoleId') visibleRoleId: string,
  ) {
    return this.rolePermissionService.removeRoleVisibility(id, visibleRoleId);
  }
}
