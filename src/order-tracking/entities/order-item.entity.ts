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
  @Column({ name: 'product_name', type: 'varchar', nullable: true })
  productName: string | null;

  @ApiProperty({ description: 'Product SKU', example: 'LJ-001' })
  @Column({ type: 'varchar', nullable: true })
  sku: string | null;

  @ApiProperty({ description: 'Product color', example: 'Black', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @ApiProperty({ description: 'Product size', example: 'M', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  size: string | null;

  @ApiProperty({ description: 'Product gender', example: 'Male', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  gender: string | null;

  @ApiProperty({ description: 'Product image URL', example: 'https://example.com/image.jpg', nullable: true })
  @Column({ name: 'product_image', type: 'varchar', nullable: true })
  productImage: string | null;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ description: 'Is leather product', example: true, default: false })
  @Column({ name: 'is_leather', type: 'boolean', default: false })
  isLeather: boolean;

  @ApiProperty({ description: 'Is pattern product', example: false, default: false })
  @Column({ name: 'is_pattern', type: 'boolean', default: false })
  isPattern: boolean;

  @ApiProperty({ description: 'QR code data for scanning', example: 'ORDER_ITEM_UUID_HASH' })
  @Column({ name: 'qr_code', unique: true, nullable: true })
  qrCode: string;

  @ApiProperty({ description: 'QR code URL for scanning', example: 'https://example.com/orders/fineyst-jackets?orderItemId=uuid' })
  @Column({ name: 'qr_code_url', type: 'text', nullable: true })
  qrCodeUrl: string | null;

  @ApiProperty({ description: 'QR code image data (base64)', nullable: true })
  @Column({ name: 'qr_code_image', type: 'text', nullable: true })
  qrCodeImage: string | null;

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
    description: 'Order status',
    example: 'cutting_in_progress',
    nullable: true
  })
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'order_status'
  })
  orderStatus: string | null;

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

  @ApiProperty({ 
    description: 'Visibility status - JSON object with roleIds and roleNames',
    example: { roleIds: ['uuid-1', 'uuid-2'], roleNames: ['cutting-manager', 'production-manager'] },
    nullable: true
  })
  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'visibility_status'
  })
  visibilityStatus: { roleIds: string[]; roleNames: string[] } | null;

  @ApiProperty({ description: 'Order item creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('OrderItemTracking', 'orderItem')
  trackingHistory: any[];
}

