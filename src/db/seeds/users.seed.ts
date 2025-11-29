import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role-permission/entities/role.entity';
import { Department } from '../../department/entities/department.entity';

export const usersSeed = async (dataSource: DataSource): Promise<void> => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const departmentRepository = dataSource.getRepository(Department);

  // Check if user already exists
  const existingUser = await userRepository.findOne({
    where: { email: 'muhammadhuzaifa.dev@gmail.com' }
  });

  if (existingUser) {
    console.log('User already exists, skipping...');
    return;
  }

  // Get admin role
  const adminRole = await roleRepository.findOne({
    where: { name: 'admin' }
  });

  if (!adminRole) {
    throw new Error('Admin role not found. Please run roles seed first.');
  }

  // Get any department (first one available)
  const department = await departmentRepository.findOne({
    where: {}
  });

  // Create admin user
  const adminUser = userRepository.create({
    email: 'muhammadhuzaifa.dev@gmail.com',
    password: '12345678',
    firstName: 'Muhammad',
    lastName: 'Huzaifa',
    role: adminRole,
    department: department,
    status: 'active',
    isEmailVerified: true
  });

  await userRepository.save(adminUser);
  console.log('Admin user created successfully');
};