import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryItem } from './inventory-item.entity';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Product unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product name', example: 'Premium Leather Jacket' })
  @Column()
  name: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'LJ-001' })
  @Column({ unique: true, nullable: true })
  sku: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({ description: 'Product price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @OneToMany(() => InventoryItem, (item) => item.product)
  inventoryItems: InventoryItem[];

  @ApiProperty({ description: 'Product creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
