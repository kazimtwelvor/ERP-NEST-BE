import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';
import { Permission } from '../role-permission/entities/permission.entity';
import { Department } from '../department/entities/department.entity';
import { OrderItem } from '../order-tracking/entities/order-item.entity';
import { OrderItemTracking } from '../order-tracking/entities/order-item-tracking.entity';
import { OrderStatus } from '../order-tracking/entities/order-status.entity';
import { RoleVisibility } from '../role-permission/entities/role-visibility.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  const dbSynchronize = configService.get<string>('DB_SYNCHRONIZE');
  const dbLogging = configService.get<string>('DB_LOGGING');
  const dbSsl = configService.get<string>('DB_SSL');
  const dbSslRejectUnauthorized = configService.get<string>(
    'DB_SSL_REJECT_UNAUTHORIZED',
  );

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_DATABASE', 'erp_database'),
    entities: [User, Role, Permission, Department, OrderItem, OrderItemTracking, OrderStatus, RoleVisibility],
    synchronize:
      dbSynchronize !== undefined
        ? dbSynchronize === 'true'
        : isDevelopment,
    logging:
      dbLogging !== undefined ? dbLogging === 'true' : isDevelopment,
    ssl:
      isProduction || dbSsl === 'true'
        ? {
            rejectUnauthorized:
              dbSslRejectUnauthorized === 'true' ? true : false,
          }
        : false,
    extra: {
      max: configService.get<number>('DB_MAX_CONNECTIONS', 10),
      connectionTimeoutMillis: configService.get<number>(
        'DB_CONNECTION_TIMEOUT',
        30000,
      ),
      idleTimeoutMillis: configService.get<number>(
        'DB_IDLE_TIMEOUT',
        30000,
      ),
      query_timeout: configService.get<number>(
        'DB_QUERY_TIMEOUT',
        60000,
      ),
    },
  };
};

