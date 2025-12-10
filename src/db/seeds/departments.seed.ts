import { DataSource } from 'typeorm';
import { Department } from '../../department/entities/department.entity';

export const departmentsSeed = async (dataSource: DataSource): Promise<void> => {
  const departmentRepository = dataSource.getRepository(Department);

  const departments = [
    {
      name: 'Inventory',
      code: 'INV',
      description: 'Leather inventory management and availability tracking',
      status: 'active',
    },
    {
      name: 'Cutting',
      code: 'CUT',
      description: 'Leather cutting and preparation department',
      status: 'active',
    },
    {
      name: 'Embroidery',
      code: 'EMB',
      description: 'Embroidery and design application department',
      status: 'active',
    },
    {
      name: 'Rivets',
      code: 'RIV',
      description: 'Rivets installation and hardware attachment department',
      status: 'active',
    },
    {
      name: 'Stitching',
      code: 'STI',
      description: 'Stitching and assembly department',
      status: 'active',
    },
    {
      name: 'Packing',
      code: 'PAC',
      description: 'Packing and packaging department',
      status: 'active',
    },
    {
      name: 'Quality Control',
      code: 'QC',
      description: 'Quality control inspection and testing department',
      status: 'active',
    },
    {
      name: 'Logistics',
      code: 'LOG',
      description: 'Shipping, transportation, and customs clearance department',
      status: 'active',
    },
    {
      name: 'Finance & Accounting',
      code: 'FIN',
      description: 'Financial management, accounting, and budget control',
      status: 'active',
    },
    {
      name: 'IT & Technology',
      code: 'IT',
      description: 'IT infrastructure, system maintenance, and technical support',
      status: 'active',
    },
  ];

  for (const departmentData of departments) {
    const existingDepartment = await departmentRepository.findOne({
      where: [{ name: departmentData.name }, { code: departmentData.code }],
    });

    if (!existingDepartment) {
      const department = departmentRepository.create(departmentData);
      await departmentRepository.save(department);
      console.log(`✓ Created department: ${departmentData.name} (${departmentData.code})`);
    } else {
      console.log(`- Department already exists: ${departmentData.name} (${departmentData.code})`);
    }
  }
};

