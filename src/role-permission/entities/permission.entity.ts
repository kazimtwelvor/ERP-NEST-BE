import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @ApiProperty({ description: 'Permission unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Permission name (unique)', example: 'user.create' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Permission display name', example: 'Create User' })
  @Column({ name: 'display_name' })
  displayName: string;

  @ApiProperty({ description: 'Permission description', example: 'Allows creating new users' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Module/Resource this permission belongs to', example: 'user' })
  @Column()
  module: string;

  @ApiProperty({ description: 'Action type', example: 'create' })
  @Column()
  action: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ApiProperty({ description: 'Permission creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

