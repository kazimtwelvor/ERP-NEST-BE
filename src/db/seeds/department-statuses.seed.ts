import { DataSource } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { DepartmentStatus } from '../../department/entities/department-status.entity';
import { DepartmentStatusMap } from '../../order-tracking/enums/department-status.enum';

export const departmentStatusesSeed = async (dataSource: DataSource): Promise<void> => {
  const departmentRepository = dataSource.getRepository(Department);
  const departmentStatusRepository = dataSource.getRepository(DepartmentStatus);

  const departmentStatusMapping: Record<string, string> = {
    'INV': 'inventory', // Inventory department
    'CUT': 'cutting', // Cutting department
    'EMB': 'embroidery', // Embroidery department
    'RIV': 'rivets', // Rivets department
    'STCH': 'stitching', // Stitching department
    'PKG': 'packing', // Packing department
    'QC': 'quality-control', // Quality Control department
    'LOG': 'logistics', // Logistics department
  };

  // Alternative: Map by department name (case-insensitive partial match)
  const departmentNameMapping: Record<string, string> = {
    'inventory': 'inventory',
    'cutting': 'cutting',
    'embroidery': 'embroidery',
    'rivets': 'rivets',
    'stitching': 'stitching',
    'packing': 'packing',
    'quality': 'quality-control',
    'quality control': 'quality-control',
    'logistics': 'logistics',
  };

  // Get all departments
  const allDepartments = await departmentRepository.find();

  for (const department of allDepartments) {
    let statusMapKey: string | undefined;

    // Try to find matching status map key by department code
    if (department.code && departmentStatusMapping[department.code.toUpperCase()]) {
      statusMapKey = departmentStatusMapping[department.code.toUpperCase()];
    }
    // Try to find by department name
    else if (department.name) {
      const departmentNameLower = department.name.toLowerCase();
      for (const [key, value] of Object.entries(departmentNameMapping)) {
        if (departmentNameLower.includes(key)) {
          statusMapKey = value;
          break;
        }
      }
    }

    if (!statusMapKey || !DepartmentStatusMap[statusMapKey]) {
      console.log(`- No status mapping found for department: ${department.name} (${department.code})`);
      continue;
    }

    const statusesToAssign = DepartmentStatusMap[statusMapKey];
    
    // Check if statuses already exist for this department
    const existingStatuses = await departmentStatusRepository.find({
      where: { departmentId: department.id },
    });

    if (existingStatuses.length > 0) {
      console.log(`- Department ${department.name} already has ${existingStatuses.length} statuses assigned. Skipping...`);
      continue;
    }

    // Create department statuses
    const departmentStatuses = statusesToAssign.map((status, index) => {
      return departmentStatusRepository.create({
        departmentId: department.id,
        status: status,
        displayOrder: index,
        isActive: true,
      });
    });

    await departmentStatusRepository.save(departmentStatuses);
    console.log(
      `✓ Assigned ${departmentStatuses.length} statuses to department: ${department.name} (${department.code})`,
    );
  }

  // Also create departments if they don't exist and assign statuses
  const requiredDepartments = [
    { name: 'Inventory', code: 'INV', description: 'Inventory and leather management' },
    { name: 'Cutting', code: 'CUT', description: 'Cutting department' },
    { name: 'Embroidery', code: 'EMB', description: 'Embroidery department' },
    { name: 'Rivets', code: 'RIV', description: 'Rivets installation department' },
    { name: 'Stitching', code: 'STCH', description: 'Stitching department' },
    { name: 'Packing', code: 'PKG', description: 'Packing department' },
    { name: 'Quality Control', code: 'QC', description: 'Quality control and inspection' },
    { name: 'Logistics', code: 'LOG', description: 'Shipping and logistics' },
  ];

  for (const deptData of requiredDepartments) {
    const existingDepartment = await departmentRepository.findOne({
      where: [{ name: deptData.name }, { code: deptData.code }],
    });

    if (!existingDepartment) {
      const department = departmentRepository.create({
        ...deptData,
        status: 'active',
      });
      const savedDepartment = await departmentRepository.save(department);
      console.log(`✓ Created department: ${deptData.name} (${deptData.code})`);

      // Assign statuses to the newly created department
      const statusMapKey = departmentStatusMapping[deptData.code];
      if (statusMapKey && DepartmentStatusMap[statusMapKey]) {
        const statusesToAssign = DepartmentStatusMap[statusMapKey];
        const departmentStatuses = statusesToAssign.map((status, index) => {
          return departmentStatusRepository.create({
            departmentId: savedDepartment.id,
            status: status,
            displayOrder: index,
            isActive: true,
          });
        });

        await departmentStatusRepository.save(departmentStatuses);
        console.log(
          `✓ Assigned ${departmentStatuses.length} statuses to department: ${deptData.name} (${deptData.code})`,
        );
      }
    }
  }
};

