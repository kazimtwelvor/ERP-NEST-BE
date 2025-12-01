import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTrackingService } from './order-tracking.service';
import { OrderTrackingController } from './order-tracking.controller';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemTracking } from './entities/order-item-tracking.entity';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, OrderItemTracking, Department, User, Role]),
  ],
  controllers: [OrderTrackingController],
  providers: [OrderTrackingService],
  exports: [OrderTrackingService],
})
export class OrderTrackingModule {}

