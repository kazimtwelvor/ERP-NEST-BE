import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';
import { Permission } from '../role-permission/entities/permission.entity';
import { Department } from '../department/entities/department.entity';
import { OrderItem } from '../order-tracking/entities/order-item.entity';
import { OrderItemTracking } from '../order-tracking/entities/order-item-tracking.entity';
import { OrderStatus } from '../order-tracking/entities/order-status.entity';
import { RoleVisibility } from '../role-permission/entities/role-visibility.entity';
import { Product } from '../inventory/entities/product.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

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
  entities: [User, Role, Permission, Department, OrderItem, OrderItemTracking, OrderStatus, RoleVisibility, Product, InventoryItem],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  // Only enable SSL in production or if explicitly set
  // For local development, explicitly disable SSL
  ssl:
    (process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true') &&
    process.env.NODE_ENV !== 'development'
      ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
        }
      : false, // Explicitly disable SSL for local development
  extra: {
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000', 10),
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

