import { DataSource } from 'typeorm';
import { Role } from '../../role-permission/entities/role.entity';
import { OrderStatus } from '../../order-tracking/entities/order-status.entity';
import { DepartmentStatusMap } from '../../order-tracking/enums/department-status.enum';

export const orderStatusesSeed = async (dataSource: DataSource): Promise<void> => {
  const roleRepository = dataSource.getRepository(Role);
  const orderStatusRepository = dataSource.getRepository(OrderStatus);

  // Map of role names to their status map keys
  const roleStatusMapping: Record<string, string> = {
    'inventory-manager': 'inventory',
    'cutting-manager': 'cutting',
    'cutting-worker': 'cutting',
    'embroidery-manager': 'embroidery',
    'embroidery-worker': 'embroidery',
    'rivets-manager': 'rivets',
    'rivets-worker': 'rivets',
    'stitching-manager': 'stitching',
    'stitching-worker': 'stitching',
    'packing-manager': 'packing',
    'packing-worker': 'packing',
    'quality-control-manager': 'quality-control',
    'quality-control-worker': 'quality-control',
    'logistics-manager': 'logistics',
    'logistics-worker': 'logistics',
  };

  // Get all roles
  const allRoles = await roleRepository.find();

  for (const role of allRoles) {
    let statusMapKey: string | undefined;

    // Try to find matching status map key by role name
    if (role.name && roleStatusMapping[role.name.toLowerCase()]) {
      statusMapKey = roleStatusMapping[role.name.toLowerCase()];
    }

    if (!statusMapKey || !DepartmentStatusMap[statusMapKey]) {
      console.log(`- No status mapping found for role: ${role.name} (${role.displayName})`);
      continue;
    }

    const statusesToAssign = DepartmentStatusMap[statusMapKey];
    
    // Check if statuses already exist for this role
    const existingStatuses = await orderStatusRepository.find({
      where: { roleId: role.id },
    });

    if (existingStatuses.length > 0) {
      console.log(`- Role ${role.name} already has ${existingStatuses.length} order statuses assigned. Skipping...`);
      continue;
    }

    // Create order statuses
    const orderStatuses = statusesToAssign.map((status, index) => {
      return orderStatusRepository.create({
        roleId: role.id,
        status: status,
        displayOrder: index,
        isActive: true,
      });
    });

    await orderStatusRepository.save(orderStatuses);
    console.log(
      `✓ Assigned ${orderStatuses.length} order statuses to role: ${role.name} (${role.displayName})`,
    );
  }

  // Also create roles if they don't exist and assign statuses
  const requiredRoles = [
    { name: 'inventory-manager', displayName: 'Inventory Manager', description: 'Manages inventory and leather availability' },
    { name: 'cutting-manager', displayName: 'Cutting Manager', description: 'Manages cutting operations' },
    { name: 'cutting-worker', displayName: 'Cutting Worker', description: 'Performs cutting operations' },
    { name: 'embroidery-manager', displayName: 'Embroidery Manager', description: 'Manages embroidery operations' },
    { name: 'embroidery-worker', displayName: 'Embroidery Worker', description: 'Performs embroidery operations' },
    { name: 'rivets-manager', displayName: 'Rivets Manager', description: 'Manages rivets installation' },
    { name: 'rivets-worker', displayName: 'Rivets Worker', description: 'Installs rivets' },
    { name: 'stitching-manager', displayName: 'Stitching Manager', description: 'Manages stitching operations' },
    { name: 'stitching-worker', displayName: 'Stitching Worker', description: 'Performs stitching operations' },
    { name: 'packing-manager', displayName: 'Packing Manager', description: 'Manages packing operations' },
    { name: 'packing-worker', displayName: 'Packing Worker', description: 'Performs packing operations' },
    { name: 'quality-control-manager', displayName: 'Quality Control Manager', description: 'Manages quality control' },
    { name: 'quality-control-worker', displayName: 'Quality Control Worker', description: 'Performs quality inspections' },
    { name: 'logistics-manager', displayName: 'Logistics Manager', description: 'Manages shipping and logistics' },
    { name: 'logistics-worker', displayName: 'Logistics Worker', description: 'Handles shipping operations' },
  ];

  for (const roleData of requiredRoles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      const role = roleRepository.create({
        ...roleData,
        status: 'active',
        isSystem: false,
      });
      const savedRole = await roleRepository.save(role);
      console.log(`✓ Created role: ${roleData.name} (${roleData.displayName})`);

      // Assign statuses to the newly created role
      const statusMapKey = roleStatusMapping[roleData.name];
      if (statusMapKey && DepartmentStatusMap[statusMapKey]) {
        const statusesToAssign = DepartmentStatusMap[statusMapKey];
        const orderStatuses = statusesToAssign.map((status, index) => {
          return orderStatusRepository.create({
            roleId: savedRole.id,
            status: status,
            displayOrder: index,
            isActive: true,
          });
        });

        await orderStatusRepository.save(orderStatuses);
        console.log(
          `✓ Assigned ${orderStatuses.length} order statuses to role: ${roleData.name} (${roleData.displayName})`,
        );
      }
    }
  }
};


