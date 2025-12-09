import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { User } from './entities/user.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AccessPermissions } from '../common/enums/access-permissions.enum';
import { USER_MESSAGES } from './messages/user.messages';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permissions(AccessPermissions.CreateUser)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Role or Department not found',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Permissions(AccessPermissions.ReadUser)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  @ApiResponse({
    status: 200,
    description: USER_MESSAGES.LIST_FETCHED,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async findAll(@Query() getUsersDto: GetUsersDto): Promise<PaginatedResponse<User>> {
    return this.userService.findAll(getUsersDto);
  }

  @Get(':id')
  @Permissions(AccessPermissions.ReadUser)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: USER_MESSAGES.FETCHED,
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Permissions(AccessPermissions.UpdateUser)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: USER_MESSAGES.UPDATED,
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(AccessPermissions.DeleteUser)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: USER_MESSAGES.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email with verification code' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code or email already verified',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.userService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code to user email' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email is already verified',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resendVerificationCode(@Body() resendDto: ResendVerificationDto) {
    return this.userService.resendVerificationCode(resendDto);
  }
}
