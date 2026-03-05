import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddNoteDto {
	@ApiProperty({ description: 'User ID who is creating the note' })
	@IsUUID()
	@IsNotEmpty()
	userId: string;

	@ApiProperty({ description: 'Note content' })
	@IsString()
	@IsNotEmpty()
	note: string;

	@ApiProperty({ description: 'Image URL', required: false })
	@IsString()
	@IsOptional()
	imageUrl?: string;
}
