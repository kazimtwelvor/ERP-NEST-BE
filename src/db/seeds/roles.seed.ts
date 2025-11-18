import { DataSource } from 'typeorm';
import { Role } from '../../role-permission/entities/role.entity';
import { Permission } from '../../role-permission/entities/permission.entity';

export const rolesSeed = async (dataSource: DataSource): Promise<void> => {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  const allPermissions = await permissionRepository.find();

  const rolePermissionsMap = {
    admin: allPermissions.map(p => p.name), 
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
      name: 'employee',
      displayName: 'Employee',
      description: 'Standard employee access with limited permissions',
      status: 'active',
      isSystem: true,
      permissions: rolePermissionsMap.employee,
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

