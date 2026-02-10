import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { Notification } from './entities/notification.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AccessPermissions } from '../common/enums/access-permissions.enum';
import { NOTIFICATION_MESSAGES } from './messages/notification.messages';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  // @Permissions(AccessPermissions.CreateNotification)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: NOTIFICATION_MESSAGES.CREATED, type: Notification })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  // @Permissions(AccessPermissions.ReadNotification)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all notifications with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: NOTIFICATION_MESSAGES.LIST_FETCHED,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async findAll(@Query() getNotificationsDto: GetNotificationsDto): Promise<PaginatedResponse<Notification>> {
    return this.notificationService.findAll(getNotificationsDto);
  }

  @Get(':id')
  // @Permissions(AccessPermissions.ReadNotification)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiResponse({ status: 200, description: NOTIFICATION_MESSAGES.FETCHED, type: Notification })
  @ApiResponse({ status: 404, description: NOTIFICATION_MESSAGES.NOT_FOUND })
  async findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  // @Permissions(AccessPermissions.UpdateNotification)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiResponse({ status: 200, description: NOTIFICATION_MESSAGES.UPDATED, type: Notification })
  @ApiResponse({ status: 404, description: NOTIFICATION_MESSAGES.NOT_FOUND })
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  // @Permissions(AccessPermissions.DeleteNotification)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiResponse({ status: 200, description: NOTIFICATION_MESSAGES.DELETED })
  @ApiResponse({ status: 404, description: NOTIFICATION_MESSAGES.NOT_FOUND })
  async remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
