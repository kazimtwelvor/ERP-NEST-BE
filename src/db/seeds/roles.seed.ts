import { DataSource } from 'typeorm';
import { Role } from '../../role-permission/entities/role.entity';
import { Permission } from '../../role-permission/entities/permission.entity';

export const rolesSeed = async (dataSource: DataSource): Promise<void> => {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  // Get all permissions
  const allPermissions = await permissionRepository.find();

  // Create role-permission mappings
  const rolePermissionsMap = {
    admin: allPermissions.map(p => p.name), // Admin gets all permissions
    manager: [
      // User permissions
      'user.read', 'user.update',
      // Product permissions
      'product.create', 'product.read', 'product.update',
      // Order permissions
      'order.create', 'order.read', 'order.update', 'order.manage',
      // Inventory permissions
      'inventory.create', 'inventory.read', 'inventory.update',
      // Customer permissions
      'customer.create', 'customer.read', 'customer.update', 'customer.manage',
      // Supplier permissions
      'supplier.create', 'supplier.read', 'supplier.update', 'supplier.manage',
      // Report permissions
      'report.read', 'report.manage',
      // Settings permissions
      'settings.read',
    ],
    employee: [
      // User permissions
      'user.read',
      // Product permissions
      'product.read',
      // Order permissions
      'order.create', 'order.read', 'order.update',
      // Inventory permissions
      'inventory.read',
      // Customer permissions
      'customer.read',
      // Supplier permissions
      'supplier.read',
      // Report permissions
      'report.read',
    ],
    customer: [
      // Product permissions
      'product.read',
      // Order permissions
      'order.create', 'order.read',
      // Customer permissions (own profile)
      'customer.read', 'customer.update',
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
      name: 'manager',
      displayName: 'Manager',
      description: 'Management level access with most permissions',
      status: 'active',
      isSystem: true,
      permissions: rolePermissionsMap.manager,
    },
    {
      name: 'employee',
      displayName: 'Employee',
      description: 'Standard employee access with limited permissions',
      status: 'active',
      isSystem: true,
      permissions: rolePermissionsMap.employee,
    },
    {
      name: 'customer',
      displayName: 'Customer',
      description: 'Customer access with basic permissions',
      status: 'active',
      isSystem: true,
      permissions: rolePermissionsMap.customer,
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

      // Assign permissions
      const permissionsToAssign = allPermissions.filter(p =>
        roleData.permissions.includes(p.name)
      );
      role.permissions = permissionsToAssign;

      await roleRepository.save(role);
      console.log(`✓ Created role: ${roleData.name} with ${permissionsToAssign.length} permissions`);
    } else {
      // Update permissions if role exists
      const permissionsToAssign = allPermissions.filter(p =>
        roleData.permissions.includes(p.name)
      );
      existingRole.permissions = permissionsToAssign;
      await roleRepository.save(existingRole);
      console.log(`✓ Updated role: ${roleData.name} with ${permissionsToAssign.length} permissions`);
    }
  }
};

