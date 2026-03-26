import { DataSource } from 'typeorm';
import { Role } from '../../role-permission/entities/role.entity';
import { Permission } from '../../role-permission/entities/permission.entity';

export const rolesSeed = async (dataSource: DataSource): Promise<void> => {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  const allPermissions = await permissionRepository.find();
  const PATCH_IN_PROGRESS_PERMISSION = 'patch.status.update.in_progress';
  const PATCH_COMPLETED_PERMISSION = 'patch.status.update.completed';

  const rolePermissionsMap = {
    admin: allPermissions.map(p => p.name), 
    'patch-admin': allPermissions.map(p => p.name),
    // Split patch-admin into two variants so users don't accidentally get
    // completed-status access when they should only handle in-progress statuses.
    'patch-admin-inp': allPermissions
      .map(p => p.name)
      .filter(name => name !== PATCH_COMPLETED_PERMISSION),
    'patch-admin-c': allPermissions
      .map(p => p.name)
      .filter(name => name !== PATCH_IN_PROGRESS_PERMISSION),
    employee: [
      'user.read',
      'product.read',
      'order.create', 'order.read', 'order.update',
      'inventory.read',
      'customer.read',
      'supplier.read',
      'report.read',
    ],
  };

  const roles = [
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access with all permissions',
      status: 'active',
      isSystem: true,
      permissions: rolePermissionsMap.admin,
    },
    {
      name: 'patch-admin',
      displayName: 'Patch Administrator',
      description: 'Patch-focused admin role with full access, including patch status controls',
      status: 'active',
      isSystem: false,
      permissions: rolePermissionsMap['patch-admin'],
    },
    {
      name: 'patch-admin-inp',
      displayName: 'Patch Administrator (In-Progress)',
      description: 'Can update DIG/SAM/PRO in-progress statuses only (FIN in-progress is excluded).',
      status: 'active',
      isSystem: false,
      permissions: rolePermissionsMap['patch-admin-inp'],
    },
    {
      name: 'patch-admin-c',
      displayName: 'Patch Administrator (Completed)',
      description: 'Can update DIG/SAM/PRO/FIN completed statuses and SHP (shipping) statuses.',
      status: 'active',
      isSystem: false,
      permissions: rolePermissionsMap['patch-admin-c'],
    },
  ];

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
      relations: ['permissions'],
    });

    if (!existingRole) {
      const role = roleRepository.create({
        name: roleData.name,
        displayName: roleData.displayName,
        description: roleData.description,
        status: roleData.status,
        isSystem: roleData.isSystem,
      });

      const permissionsToAssign = allPermissions.filter(p =>
        roleData.permissions.includes(p.name)
      );
      role.permissions = permissionsToAssign;

      await roleRepository.save(role);
      console.log(`✓ Created role: ${roleData.name} with ${permissionsToAssign.length} permissions`);
    } else {
      const permissionsToAssign = allPermissions.filter(p =>
        roleData.permissions.includes(p.name)
      );
      existingRole.permissions = permissionsToAssign;
      await roleRepository.save(existingRole);
      console.log(`✓ Updated role: ${roleData.name} with ${permissionsToAssign.length} permissions`);
    }
  }
};

