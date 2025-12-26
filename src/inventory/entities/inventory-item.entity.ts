import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity('inventory_items')
@Index(['productId'], { unique: true })
export class InventoryItem {
  @ApiProperty({ description: 'Inventory item unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product', type: () => Product })
  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({ description: 'Product ID' })
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @ApiProperty({ description: 'Current quantity in stock', example: 100 })
  @Column({ name: 'quantity', type: 'int', default: 0 })
  quantity: number;

  @ApiPropertyOptional({ description: 'Reorder level (alert when stock falls below this)', example: 10 })
  @Column({ name: 'reorder_level', type: 'int', nullable: true })
  reorderLevel: number;

  @ApiProperty({ description: 'Inventory item creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
