import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatchOrderService } from './patch-order.service';
import { PatchOrderController } from './patch-order.controller';
import { PatchOrder } from './entities/patch-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatchOrder])],
  controllers: [PatchOrderController],
  providers: [PatchOrderService],
  exports: [PatchOrderService],
})
export class PatchOrderModule {}
