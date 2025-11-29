import { DataSource } from 'typeorm';
import { permissionsSeed } from './permissions.seed';
import { rolesSeed } from './roles.seed';
import { departmentsSeed } from './departments.seed';
import { usersSeed } from './users.seed';

export const runSeeds = async (dataSource: DataSource): Promise<void> => {
  try {
    console.log('📋 Seeding permissions...');
    await permissionsSeed(dataSource);
    console.log('✓ Permissions seeded successfully\n');

    console.log('👥 Seeding roles...');
    await rolesSeed(dataSource);
    console.log('✓ Roles seeded successfully\n');

    console.log('🏢 Seeding departments...');
    await departmentsSeed(dataSource);
    console.log('✓ Departments seeded successfully\n');

    console.log('👤 Seeding users...');
    await usersSeed(dataSource);
    console.log('✓ Users seeded successfully\n');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

