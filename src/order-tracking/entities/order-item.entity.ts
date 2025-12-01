import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('order_items')
@Index(['externalOrderId', 'externalItemId'], { unique: true })
export class OrderItem {
  @ApiProperty({ description: 'Order item unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'External order ID from store API', example: 'ORD-12345' })
  @Column({ name: 'external_order_id' })
  externalOrderId: string;

  @ApiProperty({ description: 'External item ID from store API', example: 'ITEM-67890' })
  @Column({ name: 'external_item_id' })
  externalItemId: string;

  @ApiProperty({ description: 'Store name', example: 'fineyst-jackets' })
  @Column({ name: 'store_name' })
  storeName: string;

  @ApiProperty({ description: 'Product name', example: 'Leather Jacket' })
  @Column({ name: 'product_name', nullable: true })
  productName: string;

  @ApiProperty({ description: 'Product SKU', example: 'LJ-001' })
  @Column({ nullable: true })
  sku: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ description: 'QR code data for scanning', example: 'ORDER_ITEM_UUID_HASH' })
  @Column({ name: 'qr_code', unique: true, nullable: true })
  qrCode: string;

  @ApiProperty({ description: 'Current department ID', nullable: true })
  @Column({ name: 'current_department_id', type: 'uuid', nullable: true })
  currentDepartmentId: string | null;

  @ApiProperty({ description: 'Last department ID (previous department)', nullable: true })
  @Column({ name: 'last_department_id', type: 'uuid', nullable: true })
  lastDepartmentId: string | null;

  @ApiProperty({ description: 'Handed over to department ID', nullable: true })
  @Column({ name: 'handed_over_department_id', type: 'uuid', nullable: true })
  handedOverDepartmentId: string | null;

  @ApiProperty({ 
    description: 'Current status',
    enum: ['pending', 'checked-in', 'in-progress', 'checked-out', 'completed', 'shipped', 'delivered'],
    default: 'pending'
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'checked-in', 'in-progress', 'checked-out', 'completed', 'shipped', 'delivered'],
    default: 'pending',
    name: 'current_status'
  })
  currentStatus: string;

  @ApiProperty({ 
    description: 'Current department-specific status',
    example: 'cutting_in_progress',
    nullable: true
  })
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'current_department_status'
  })
  currentDepartmentStatus: string | null;

  @ApiProperty({ 
    description: 'Preparation type (in-house or outsourced)',
    enum: ['in-house', 'outsourced'],
    nullable: true
  })
  @Column({
    type: 'enum',
    enum: ['in-house', 'outsourced'],
    nullable: true,
    name: 'preparation_type'
  })
  preparationType: string | null;

  @ApiProperty({ description: 'Order item creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('OrderItemTracking', 'orderItem')
  trackingHistory: any[];
}

