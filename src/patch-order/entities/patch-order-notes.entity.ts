import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PatchOrder } from './patch-order.entity';
import { User } from '../../user/entities/user.entity';

@Entity('patch_order_notes')
export class PatchOrderNotes {
	@ApiProperty({ description: 'Note unique identifier (UUID)' })
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ApiProperty({ description: 'Patch order ID' })
	@Column({ name: 'patch_order_id', type: 'uuid' })
	patchOrderId: string;

	@ApiProperty({ description: 'User ID who created the note' })
	@Column({ name: 'user_id', type: 'uuid' })
	userId: string;

	@ApiProperty({ description: 'Note content' })
	@Column({ type: 'text' })
	note: string;

	@ApiProperty({ description: 'Order status at the time of note creation' })
	@Column({ name: 'order_status', type: 'varchar', nullable: true })
	orderStatus: string | null;

	@ApiProperty({ description: 'Note creation timestamp' })
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@ManyToOne(() => PatchOrder, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'patch_order_id' })
	patchOrder: PatchOrder;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User;
}
