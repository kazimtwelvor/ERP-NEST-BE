import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';
import { Permission } from '../role-permission/entities/permission.entity';
import { Department } from '../department/entities/department.entity';
import { OrderItem } from '../order-tracking/entities/order-item.entity';
import { OrderItemTracking } from '../order-tracking/entities/order-item-tracking.entity';

try {
  require('dotenv').config();
} catch {
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'erp_database',
  entities: [User, Role, Permission, Department, OrderItem, OrderItemTracking],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
        }
      : false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

