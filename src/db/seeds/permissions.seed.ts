import { DataSource } from 'typeorm';
import { Permission } from '../../role-permission/entities/permission.entity';

export const permissionsSeed = async (dataSource: DataSource): Promise<void> => {
  const permissionRepository = dataSource.getRepository(Permission);

  const permissions = [
    // User permissions
    { name: 'user.create', displayName: 'Create User', module: 'user', action: 'create', description: 'Allows creating new users' },
    { name: 'user.read', displayName: 'View Users', module: 'user', action: 'read', description: 'Allows viewing user information' },
    { name: 'user.update', displayName: 'Update User', module: 'user', action: 'update', description: 'Allows updating user information' },
    { name: 'user.delete', displayName: 'Delete User', module: 'user', action: 'delete', description: 'Allows deleting users' },
    { name: 'user.manage', displayName: 'Manage Users', module: 'user', action: 'manage', description: 'Full user management access' },

    { name: 'department.create', displayName: 'Create Department', module: 'department', action: 'create', description: 'Allows creating new departments' },
    { name: 'department.read', displayName: 'View Departments', module: 'department', action: 'read', description: 'Allows viewing department information' },
    { name: 'department.update', displayName: 'Update Department', module: 'department', action: 'update', description: 'Allows updating department information' },
    { name: 'department.delete', displayName: 'Delete Department', module: 'department', action: 'delete', description: 'Allows deleting departments' },
    { name: 'department.manage', displayName: 'Manage Departments', module: 'department', action: 'manage', description: 'Full department management access' },

    { name: 'role-permission.create', displayName: 'Create Role Permission', module: 'role-permission', action: 'create', description: 'Allows creating new role permissions' },
    { name: 'role-permission.read', displayName: 'View Role Permissions', module: 'role-permission', action: 'read', description: 'Allows viewing role permission information' },
    { name: 'role-permission.update', displayName: 'Update Role Permission', module: 'role-permission', action: 'update', description: 'Allows updating role permission information' },
    { name: 'role-permission.delete', displayName: 'Delete Role Permission', module: 'role-permission', action: 'delete', description: 'Allows deleting role permissions' },
    { name: 'role-permission.manage', displayName: 'Manage Role Permissions', module: 'role-permission', action: 'manage', description: 'Full role permission management access' },

    { name: 'order.create', displayName: 'Create Order', module: 'order', action: 'create', description: 'Allows creating new orders' },
    { name: 'order.read', displayName: 'View Orders', module: 'order', action: 'read', description: 'Allows viewing order information' },
    { name: 'order.update', displayName: 'Update Order', module: 'order', action: 'update', description: 'Allows updating order information' },
    { name: 'order.delete', displayName: 'Delete Order', module: 'order', action: 'delete', description: 'Allows deleting orders' },
    { name: 'order.manage', displayName: 'Manage Orders', module: 'order', action: 'manage', description: 'Full order management access' },
  ];

  for (const permissionData of permissions) {
    const existingPermission = await permissionRepository.findOne({
      where: { name: permissionData.name },
    });

    if (!existingPermission) {
      const permission = permissionRepository.create(permissionData);
      await permissionRepository.save(permission);
      console.log(`✓ Created permission: ${permissionData.name}`);
    } else {
      console.log(`- Permission already exists: ${permissionData.name}`);
    }
  }
};

