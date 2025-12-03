import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role-permission/entities/role.entity';
import { Department } from '../../department/entities/department.entity';

export const usersSeed = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const departmentRepository = dataSource.getRepository(Department);

  // Get admin role
  const adminRole = await roleRepository.findOne({
    where: { name: 'admin' }
  });

  if (!adminRole) {
    throw new Error('Admin role not found. Please run roles seed first.');
  }

  // Get any department (first one available) - optional
  const department = await departmentRepository.findOne({
    where: {}
  });

  // Admin user
  const adminEmail = 'syedhamzaimran31@gmail.com';
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const adminUser = userRepository.create({
      email: adminEmail,
      password: 'Syed@123',
      firstName: 'Syed',
      lastName: 'Hamza',
      role: adminRole,
      department: department || null,
      status: 'active',
      isEmailVerified: true
    });

    await userRepository.save(adminUser);
    console.log(`✓ Created admin user: ${adminEmail}`);
  } else {
    console.log(`- Admin user already exists: ${adminEmail}`);
  }

  // Legacy admin user (keep for backward compatibility)
  const legacyEmail = 'muhammadhuzaifa.dev@gmail.com';
  const existingLegacy = await userRepository.findOne({
    where: { email: legacyEmail }
  });

  if (!existingLegacy) {
    const legacyUser = userRepository.create({
      email: legacyEmail,
      password: '12345678',
      firstName: 'Muhammad',
      lastName: 'Huzaifa',
      role: adminRole,
      department: department || null,
      status: 'active',
      isEmailVerified: true
    });

    await userRepository.save(legacyUser);
    console.log(`✓ Created admin user: ${legacyEmail}`);
  } else {
    console.log(`- Admin user already exists: ${legacyEmail}`);
  }
};