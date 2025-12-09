import { DataSource } from 'typeorm';
import { runSeeds } from './index';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role-permission/entities/role.entity';
import { Permission } from '../../role-permission/entities/permission.entity';
import { Department } from '../../department/entities/department.entity';
import { OrderStatus } from '../../order-tracking/entities/order-status.entity';
import { RoleVisibility } from '../../role-permission/entities/role-visibility.entity';
import { OrderItem } from '../../order-tracking/entities/order-item.entity';
import { OrderItemTracking } from '../../order-tracking/entities/order-item-tracking.entity';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
  });
}

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'erp_database',
    entities: [User, Role, Permission, Department, OrderStatus, RoleVisibility, OrderItem, OrderItemTracking],
    synchronize: false,
    logging: isDevelopment,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');
    
    await runSeeds(dataSource);
    
    await dataSource.destroy();
    console.log('\n✅ Seed process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

bootstrap();

