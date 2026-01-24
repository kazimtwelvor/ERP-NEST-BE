import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PatchFormType {
  ContactForm = 'contactForm',
  QuoteForm = 'quoteForm',
  DetailedForm = 'detailedForm',
  CallbackForm = 'callbackForm',
  NewsletterForm = 'newsletterForm',
  ForCategoryFor = 'forCategoryFor',
}

@Entity('patch_orders')
export class PatchOrder {
  @ApiProperty({ description: 'Patch order unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Customer full name', required: false })
  @Column({ name: 'customer_name', type: 'varchar', nullable: true })
  customerName?: string | null;

  @ApiProperty({ description: 'Customer email address', required: false })
  @Column({ name: 'customer_email', type: 'varchar', nullable: true })
  customerEmail?: string | null;

  @ApiPropertyOptional({ description: 'Customer phone number' })
  @Column({ name: 'customer_phone', type: 'varchar', nullable: true })
  customerPhone?: string | null;

  @ApiPropertyOptional({
    description: 'External or client order identifier',
    required: false,
  })
  @Column({ name: 'order_id', type: 'varchar', nullable: true })
  orderId?: string | null;

  @ApiProperty({
    description: 'Auto-generated order number',
    example: 'ORD_00001',
  })
  @Column({ name: 'order_no', type: 'varchar', unique: true, nullable: true })
  orderNo?: string;

  @ApiProperty({
    description: 'Submitted form type',
    enum: PatchFormType,
    required: false,
  })
  @Column({
    name: 'form_type',
    type: 'enum',
    enum: PatchFormType,
    nullable: true,
  })
  formType?: PatchFormType | null;

  @ApiProperty({ description: 'Requested patch shape', required: false })
  @Column({ type: 'varchar', nullable: true })
  shape?: string | null;

  @ApiProperty({ description: 'Requested patch size', required: false })
  @Column({ type: 'varchar', nullable: true })
  size?: string | null;

  @ApiProperty({ description: 'Requested quantity', required: false })
  @Column({ type: 'int', nullable: true })
  quantity?: number | null;

  @ApiProperty({ description: 'Backing type for the patch', required: false })
  @Column({ name: 'backing_type', type: 'varchar', nullable: true })
  backingType?: string | null;

  @ApiProperty({ description: 'Embroidery coverage details', required: false })
  @Column({ name: 'embroidery_coverage', type: 'varchar', nullable: true })
  embroideryCoverage?: string | null;

  @ApiProperty({ description: 'Border style for the patch', required: false })
  @Column({ type: 'varchar', nullable: true })
  border?: string | null;

  @ApiProperty({ description: 'Primary color for the patch', required: false })
  @Column({ type: 'varchar', nullable: true })
  color?: string | null;

  @ApiProperty({ description: 'Type of patch', required: false })
  @Column({ name: 'patch_type', type: 'varchar', nullable: true })
  patchType?: string | null;

  @ApiPropertyOptional({
    description: 'Image reference or URL for the patch design',
  })
  @Column({ type: 'text', nullable: true })
  image?: string | null;

  @ApiProperty({
    description: 'QR code data for scanning',
    example: 'PATCH_ORDER_UUID_HASH',
  })
  @Column({ name: 'qr_code', unique: true, nullable: true })
  qrCode: string;

  @ApiProperty({
    description: 'QR code URL for scanning',
    example: 'https://example.com/patch-orders?patchOrderId=uuid',
  })
  @Column({ name: 'qr_code_url', type: 'text', nullable: true })
  qrCodeUrl: string | null;

  @ApiProperty({
    description: 'Current status (can be pending or production)',
    example: 'production',
    default: 'pending',
  })
  @Column({
    type: 'varchar',
    default: 'pending',
    name: 'status',
  })
  status: string;

  @ApiProperty({
    description: 'Order status',
    example: 'sample_approved',
    nullable: true,
  })
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'order_status',
  })
  orderStatus: string | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
