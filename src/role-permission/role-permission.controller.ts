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
import { Permissions } from '../common/decorators/permissions.decorator';
import { AccessPermissions } from '../common/enums/access-permissions.enum';
import { ROLE_PERMISSION_MESSAGES } from './messages/role-permission.messages';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('role-permission')
export class RolePermissionController {
  
  constructor(private readonly rolePermissionService: RolePermissionService) {}

 
  @Post('roles')
  @Permissions(AccessPermissions.CreateRolePermission)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: ROLE_PERMISSION_MESSAGES.ROLE_CREATED,
    type: Role,
  })
  @ApiResponse({ status: 409, description: ROLE_PERMISSION_MESSAGES.ROLE_ALREADY_EXISTS })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolePermissionService.createRole(createRoleDto);
  }

  @Get('roles')
  // @Permissions(AccessPermissions.ReadRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: ROLE_PERMISSION_MESSAGES.ROLES_FETCHED,
    type: [Role],
  })
  async findAllRoles(@Query() getRolesDto: GetRolesDto) {
    return this.rolePermissionService.findAllRoles(getRolesDto);
  }

  @Get('roles/:id')
  @Permissions(AccessPermissions.ReadRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: ROLE_PERMISSION_MESSAGES.ROLE_FETCHED,
    type: Role,
  })
  @ApiResponse({ status: 404, description: ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND })
  async findOneRole(@Param('id') id: string) {
    return this.rolePermissionService.findOneRole(id);
  }

  @Patch('roles/:id')
  @Permissions(AccessPermissions.UpdateRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: ROLE_PERMISSION_MESSAGES.ROLE_UPDATED,
    type: Role,
  })
  @ApiResponse({ status: 404, description: ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND })
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolePermissionService.updateRole(id, updateRoleDto);
  }

  @Post('roles/:id/permissions')
  @Permissions(AccessPermissions.UpdateRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: ROLE_PERMISSION_MESSAGES.PERMISSIONS_ASSIGNED,
    type: Role,
  })
  @ApiResponse({ status: 404, description: ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND })
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rolePermissionService.assignPermissionsToRole(id, assignPermissionsDto);
  }

  @Delete('roles/:id')
  @Permissions(AccessPermissions.DeleteRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({ status: 200, description: ROLE_PERMISSION_MESSAGES.ROLE_DELETED })
  @ApiResponse({ status: 404, description: ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND })
  @ApiResponse({ status: 400, description: ROLE_PERMISSION_MESSAGES.ROLE_SYSTEM_CANNOT_DELETE })
  async removeRole(@Param('id') id: string) {
    return this.rolePermissionService.removeRole(id);
  }

  // ========== Permission Endpoints ==========

  @Post('permissions')
  @Permissions(AccessPermissions.CreateRolePermission)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: ROLE_PERMISSION_MESSAGES.PERMISSION_CREATED,
    type: Permission,
  })
  @ApiResponse({ status: 409, description: ROLE_PERMISSION_MESSAGES.PERMISSION_ALREADY_EXISTS })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rolePermissionService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @Permissions(AccessPermissions.ReadRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: ROLE_PERMISSION_MESSAGES.PERMISSIONS_FETCHED,
    type: [Permission],
  })
  async findAllPermissions(@Query() getPermissionsDto: GetPermissionsDto) {
    return this.rolePermissionService.findAllPermissions(getPermissionsDto);
  }

  @Get('permissions/:id')
  @Permissions(AccessPermissions.ReadRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: ROLE_PERMISSION_MESSAGES.PERMISSION_FETCHED,
    type: Permission,
  })
  @ApiResponse({ status: 404, description: ROLE_PERMISSION_MESSAGES.PERMISSION_NOT_FOUND })
  async findOnePermission(@Param('id') id: string) {
    return this.rolePermissionService.findOnePermission(id);
  }

  @Patch('permissions/:id')
  @Permissions(AccessPermissions.UpdateRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: ROLE_PERMISSION_MESSAGES.PERMISSION_UPDATED,
    type: Permission,
  })
  @ApiResponse({ status: 404, description: ROLE_PERMISSION_MESSAGES.PERMISSION_NOT_FOUND })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rolePermissionService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @Permissions(AccessPermissions.DeleteRolePermission)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID (UUID)' })
  @ApiResponse({ status: 200, description: ROLE_PERMISSION_MESSAGES.PERMISSION_DELETED })
  @ApiResponse({ status: 404, description: ROLE_PERMISSION_MESSAGES.PERMISSION_NOT_FOUND })
  @ApiResponse({ status: 400, description: 'Cannot delete permission assigned to roles' })
  async removePermission(@Param('id') id: string) {
    return this.rolePermissionService.removePermission(id);
  }

  // ========== Order Status Management Endpoints ==========

  @Post('roles/:id/order-statuses')
  @Permissions(AccessPermissions.UpdateRolePermission)
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
    description: ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND,
  })
  async assignOrderStatuses(
    @Param('id') id: string,
    @Body() assignStatusesDto: AssignOrderStatusesDto,
  ) {
    return this.rolePermissionService.assignOrderStatuses(id, assignStatusesDto);
  }

  @Get('roles/:id/order-statuses')
  // @Permissions(AccessPermissions.ReadRolePermission)
  @HttpCode(HttpStatus.OK)
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
    description: ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND,
  })
  async getRoleOrderStatuses(@Param('id') id: string) {
    return this.rolePermissionService.getRoleOrderStatuses(id);
  }

  @Patch('roles/:id/order-statuses/:status')
  // @Permissions(AccessPermissions.UpdateRolePermission)
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
  @Permissions(AccessPermissions.UpdateRolePermission)
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
  @Permissions(AccessPermissions.ReadRolePermission)
  @HttpCode(HttpStatus.OK)
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
  // @Permissions(AccessPermissions.UpdateRolePermission)
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
  // @Permissions(AccessPermissions.ReadRolePermission)
  @HttpCode(HttpStatus.OK)
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
    description: ROLE_PERMISSION_MESSAGES.ROLE_NOT_FOUND,
  })
  async getRoleVisibilities(@Param('id') id: string) {
    return this.rolePermissionService.getRoleVisibilities(id);
  }

  @Patch('roles/:id/role-visibilities/:visibleRoleId')
  // @Permissions(AccessPermissions.UpdateRolePermission)
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
  @Permissions(AccessPermissions.UpdateRolePermission)
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
