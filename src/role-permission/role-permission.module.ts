import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionController } from './role-permission.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { OrderStatus } from '../order-tracking/entities/order-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, OrderStatus])],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
