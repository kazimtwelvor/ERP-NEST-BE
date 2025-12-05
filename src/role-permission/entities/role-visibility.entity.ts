import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity('role_visibilities')
@Unique(['roleId', 'visibleRoleId'])
@Index(['roleId', 'visibleRoleId'])
export class RoleVisibility {
  @ApiProperty({ description: 'Role visibility unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Role reference (the role that has visibility permissions)',
    type: () => Role,
  })
  @ManyToOne(() => Role, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: string;

  @ApiProperty({
    description: 'The role that is visible to the role',
    type: () => Role,
  })
  @ManyToOne(() => Role, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visible_role_id' })
  visibleRole: Role;

  @ApiProperty({
    description: 'The role ID that is visible to the role',
    example: 'cfdd3501-ee68-4454-9580-fd1f125a8ce6',
  })
  @Column({ name: 'visible_role_id' })
  visibleRoleId: string;

  @ApiProperty({
    description: 'Display order for sorting visibilities',
    default: 0,
  })
  @Column({
    type: 'int',
    default: 0,
    name: 'display_order',
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether this visibility is active for the role',
    default: true,
  })
  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @ApiProperty({ description: 'Role visibility creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

