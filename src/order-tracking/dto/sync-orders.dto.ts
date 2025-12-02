import {
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StoreName {
  FINEYST_JACKETS = 'fineyst-jackets',
  FINEYST_PATCHES = 'fineyst-patches',
}

export class SyncOrdersDto {
  @ApiProperty({
    description: 'Store name to sync orders from',
    enum: StoreName,
    example: 'fineyst-jackets',
  })
  @IsEnum(StoreName, { message: 'Invalid store name' })
  @IsNotEmpty({ message: 'Store name is required' })
  storeName: StoreName;
}

