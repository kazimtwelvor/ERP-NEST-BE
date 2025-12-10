/**
 * Access Permissions Enum
 * Matches the permission naming pattern: module.action
 * Based on permissions.seed.ts structure
 */
export enum AccessPermissions {
  // User permissions
  ReadUser = 'user.read',
  CreateUser = 'user.create',
  UpdateUser = 'user.update',
  DeleteUser = 'user.delete',
  ManageUser = 'user.manage',

  // Department permissions
  ReadDepartment = 'department.read',
  CreateDepartment = 'department.create',
  UpdateDepartment = 'department.update',
  DeleteDepartment = 'department.delete',
  ManageDepartment = 'department.manage',

  // Role-Permission permissions
  ReadRolePermission = 'role-permission.read',
  CreateRolePermission = 'role-permission.create',
  UpdateRolePermission = 'role-permission.update',
  DeleteRolePermission = 'role-permission.delete',
  ManageRolePermission = 'role-permission.manage',

  // Order permissions
  ReadOrder = 'order.read',
  CreateOrder = 'order.create',
  UpdateOrder = 'order.update',
  DeleteOrder = 'order.delete',
  ManageOrder = 'order.manage',
}





