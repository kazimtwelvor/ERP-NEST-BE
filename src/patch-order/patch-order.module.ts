import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatchOrderService } from './patch-order.service';
import { PatchOrderController } from './patch-order.controller';
import { PatchOrder } from './entities/patch-order.entity';
import { PatchOrderTracking } from './entities/patch-order-tracking.entity';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([PatchOrder, PatchOrderTracking, Department, User, Role]), NotificationModule],
  controllers: [PatchOrderController],
  providers: [PatchOrderService],
  exports: [PatchOrderService],
})
export class PatchOrderModule {}
