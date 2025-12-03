import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTrackingService } from './order-tracking.service';
import { OrderTrackingController } from './order-tracking.controller';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemTracking } from './entities/order-item-tracking.entity';
import { OrderStatus } from './entities/order-status.entity';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, OrderItemTracking, OrderStatus, Department, User, Role]),
    RolePermissionModule,
  ],
  controllers: [OrderTrackingController],
  providers: [OrderTrackingService],
  exports: [OrderTrackingService],
})
export class OrderTrackingModule {}

