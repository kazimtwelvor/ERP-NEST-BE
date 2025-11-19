import { DataSource } from 'typeorm';
import { Department } from '../../department/entities/department.entity';

export const departmentsSeed = async (dataSource: DataSource): Promise<void> => {
  const departmentRepository = dataSource.getRepository(Department);

  const departments = [
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

