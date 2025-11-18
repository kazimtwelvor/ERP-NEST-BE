import { DataSource } from 'typeorm';
import { Permission } from '../../role-permission/entities/permission.entity';

export const permissionsSeed = async (dataSource: DataSource): Promise<void> => {
  const permissionRepository = dataSource.getRepository(Permission);

  const permissions = [
    // User Module Permissions
    { name: 'user.create', displayName: 'Create User', module: 'user', action: 'create', description: 'Allows creating new users' },
    { name: 'user.read', displayName: 'View Users', module: 'user', action: 'read', description: 'Allows viewing user information' },
    { name: 'user.update', displayName: 'Update User', module: 'user', action: 'update', description: 'Allows updating user information' },
    { name: 'user.delete', displayName: 'Delete User', module: 'user', action: 'delete', description: 'Allows deleting users' },
    { name: 'user.manage', displayName: 'Manage Users', module: 'user', action: 'manage', description: 'Full user management access' },

    // Product Module Permissions
    { name: 'product.create', displayName: 'Create Product', module: 'product', action: 'create', description: 'Allows creating new products' },
    { name: 'product.read', displayName: 'View Products', module: 'product', action: 'read', description: 'Allows viewing product information' },
    { name: 'product.update', displayName: 'Update Product', module: 'product', action: 'update', description: 'Allows updating product information' },
    { name: 'product.delete', displayName: 'Delete Product', module: 'product', action: 'delete', description: 'Allows deleting products' },
    { name: 'product.manage', displayName: 'Manage Products', module: 'product', action: 'manage', description: 'Full product management access' },

    // Order Module Permissions
    { name: 'order.create', displayName: 'Create Order', module: 'order', action: 'create', description: 'Allows creating new orders' },
    { name: 'order.read', displayName: 'View Orders', module: 'order', action: 'read', description: 'Allows viewing order information' },
    { name: 'order.update', displayName: 'Update Order', module: 'order', action: 'update', description: 'Allows updating order information' },
    { name: 'order.delete', displayName: 'Delete Order', module: 'order', action: 'delete', description: 'Allows deleting orders' },
    { name: 'order.manage', displayName: 'Manage Orders', module: 'order', action: 'manage', description: 'Full order management access' },

    // Inventory Module Permissions
    { name: 'inventory.create', displayName: 'Create Inventory', module: 'inventory', action: 'create', description: 'Allows creating inventory entries' },
    { name: 'inventory.read', displayName: 'View Inventory', module: 'inventory', action: 'read', description: 'Allows viewing inventory information' },
    { name: 'inventory.update', displayName: 'Update Inventory', module: 'inventory', action: 'update', description: 'Allows updating inventory information' },
    { name: 'inventory.delete', displayName: 'Delete Inventory', module: 'inventory', action: 'delete', description: 'Allows deleting inventory entries' },
    { name: 'inventory.manage', displayName: 'Manage Inventory', module: 'inventory', action: 'manage', description: 'Full inventory management access' },

    // Customer Module Permissions
    { name: 'customer.create', displayName: 'Create Customer', module: 'customer', action: 'create', description: 'Allows creating new customers' },
    { name: 'customer.read', displayName: 'View Customers', module: 'customer', action: 'read', description: 'Allows viewing customer information' },
    { name: 'customer.update', displayName: 'Update Customer', module: 'customer', action: 'update', description: 'Allows updating customer information' },
    { name: 'customer.delete', displayName: 'Delete Customer', module: 'customer', action: 'delete', description: 'Allows deleting customers' },
    { name: 'customer.manage', displayName: 'Manage Customers', module: 'customer', action: 'manage', description: 'Full customer management access' },

    // Supplier Module Permissions
    { name: 'supplier.create', displayName: 'Create Supplier', module: 'supplier', action: 'create', description: 'Allows creating new suppliers' },
    { name: 'supplier.read', displayName: 'View Suppliers', module: 'supplier', action: 'read', description: 'Allows viewing supplier information' },
    { name: 'supplier.update', displayName: 'Update Supplier', module: 'supplier', action: 'update', description: 'Allows updating supplier information' },
    { name: 'supplier.delete', displayName: 'Delete Supplier', module: 'supplier', action: 'delete', description: 'Allows deleting suppliers' },
    { name: 'supplier.manage', displayName: 'Manage Suppliers', module: 'supplier', action: 'manage', description: 'Full supplier management access' },

    // Report Module Permissions
    { name: 'report.read', displayName: 'View Reports', module: 'report', action: 'read', description: 'Allows viewing reports' },
    { name: 'report.manage', displayName: 'Manage Reports', module: 'report', action: 'manage', description: 'Full report management access' },

    // Settings Module Permissions
    { name: 'settings.read', displayName: 'View Settings', module: 'settings', action: 'read', description: 'Allows viewing system settings' },
    { name: 'settings.update', displayName: 'Update Settings', module: 'settings', action: 'update', description: 'Allows updating system settings' },
    { name: 'settings.manage', displayName: 'Manage Settings', module: 'settings', action: 'manage', description: 'Full settings management access' },
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

