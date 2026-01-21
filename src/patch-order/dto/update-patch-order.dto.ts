import { PartialType } from '@nestjs/swagger';
import { CreatePatchOrderDto } from './create-patch-order.dto';

export class UpdatePatchOrderDto extends PartialType(CreatePatchOrderDto) {}
