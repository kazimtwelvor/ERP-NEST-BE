import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderTrackingService } from './order-tracking.service';
import { CheckInOrderItemDto } from './dto/check-in-order-item.dto';
import { CheckOutOrderItemDto } from './dto/check-out-order-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { GetTrackingHistoryDto } from './dto/get-tracking-history.dto';
import { GetOrderItemsDto } from './dto/get-order-items.dto';
import { SyncOrdersDto } from './dto/sync-orders.dto';
import { CustomSyncOrderItemsDto } from './dto/custom-sync-order-items.dto';
import { ReturnToStageDto } from './dto/return-to-stage.dto';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemTracking } from './entities/order-item-tracking.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AccessPermissions } from '../common/enums/access-permissions.enum';
import { ORDER_TRACKING_MESSAGES } from './messages/order-tracking.messages';

@ApiTags('Order Tracking')
@ApiBearerAuth()
@Controller('order-tracking')
export class OrderTrackingController {
  constructor(private readonly orderTrackingService: OrderTrackingService) {}

  @Post('sync-orders')
  @Permissions(AccessPermissions.CreateOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync orders from external store APIs' })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.ORDERS_SYNCED,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid store name or API error',
  })
  async syncOrders(@Body() syncOrdersDto: SyncOrdersDto) {
    return this.orderTrackingService.syncOrders(syncOrdersDto);
  }

  @Post('custom-sync-order')
  @Permissions(AccessPermissions.CreateOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Custom sync individual or multiple order items directly to database' })
  @ApiResponse({
    status: 200,
    description: 'Order items synced successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order items synced successfully' },
        synced: { type: 'number', example: 5 },
        updated: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async customSyncOrderItems(@Body() customSyncDto: CustomSyncOrderItemsDto) {
    return this.orderTrackingService.customSyncOrderItems(customSyncDto);
  }

  @Post('generate-qr/:orderItemId')
  @Permissions(AccessPermissions.UpdateOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate QR code for an order item' })
  @ApiParam({ name: 'orderItemId', description: 'Order item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.QR_CODE_GENERATED,
  })
  @ApiResponse({
    status: 404,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND,
  })
  async generateQRCode(@Param('orderItemId') orderItemId: string) {
    return this.orderTrackingService.generateQRCode(orderItemId);
  }

  @Get('order-item/qr/:qrCode')
  @Permissions(AccessPermissions.ReadOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get order item by QR code with optional visibility filtering' })
  @ApiParam({ name: 'qrCode', description: 'QR code of the order item' })
  @ApiQuery({ name: 'roleId', required: false, description: 'Role ID for visibility check' })
  @ApiQuery({ name: 'roleName', required: false, description: 'Role name for visibility check' })
  @ApiQuery({ name: 'roleIds', required: false, description: 'Array of role IDs for visibility check', type: [String] })
  @ApiQuery({ name: 'roleNames', required: false, description: 'Array of role names for visibility check', type: [String] })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_FETCHED,
    type: OrderItem,
  })
  @ApiResponse({
    status: 404,
    description: ORDER_TRACKING_MESSAGES.QR_CODE_NOT_FOUND,
  })
  async getOrderItemByQRCode(
    @Param('qrCode') qrCode: string,
    @Query('roleId') roleId?: string,
    @Query('roleName') roleName?: string,
    @Query('roleIds') roleIds?: string[],
    @Query('roleNames') roleNames?: string[],
  ) {
    return this.orderTrackingService.getOrderItemByQRCode(qrCode, roleId, roleName, roleIds, roleNames);
  }

  @Post('check-in')
  @Permissions(AccessPermissions.UpdateOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in order item to a department' })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.CHECKED_IN,
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND,
  })
  @ApiResponse({
    status: 400,
    description: ORDER_TRACKING_MESSAGES.ALREADY_CHECKED_IN,
  })
  @ApiResponse({
    status: 401,
    description: ORDER_TRACKING_MESSAGES.INVALID_PASSWORD,
  })
  async checkIn(@Body() checkInDto: CheckInOrderItemDto) {
    return this.orderTrackingService.checkIn(checkInDto);
  }

  @Post('check-out')
  @Permissions(AccessPermissions.UpdateOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check out order item from a department' })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.CHECKED_OUT,
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND,
  })
  @ApiResponse({
    status: 400,
    description: ORDER_TRACKING_MESSAGES.NOT_CHECKED_IN,
  })
  @ApiResponse({
    status: 401,
    description: ORDER_TRACKING_MESSAGES.INVALID_PASSWORD,
  })
  async checkOut(@Body() checkOutDto: CheckOutOrderItemDto) {
    return this.orderTrackingService.checkOut(checkOutDto);
  }

  @Post('update-status')
  @Permissions(AccessPermissions.UpdateOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order item status (e.g., to in-progress)' })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.STATUS_UPDATED,
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND,
  })
  @ApiResponse({
    status: 400,
    description: ORDER_TRACKING_MESSAGES.INVALID_STATUS_TRANSITION,
  })
  @ApiResponse({
    status: 401,
    description: ORDER_TRACKING_MESSAGES.INVALID_PASSWORD,
  })
  async updateStatus(@Body() updateStatusDto: UpdateStatusDto) {
    return this.orderTrackingService.updateStatus(updateStatusDto);
  }

  @Post('return-to-stage')
  @Permissions(AccessPermissions.UpdateOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return order item to a previous stage (e.g., after quality control failure)' })
  @ApiResponse({
    status: 200,
    description: 'Order item returned to previous stage successfully',
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid return status or department',
  })
  @ApiResponse({
    status: 401,
    description: ORDER_TRACKING_MESSAGES.INVALID_PASSWORD,
  })
  async returnToStage(@Body() returnToStageDto: ReturnToStageDto) {
    return this.orderTrackingService.returnToStage(returnToStageDto);
  }

  @Get('order-items')
  @Permissions(AccessPermissions.ReadOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all order items with optional filtering and visibility checks' })
  @ApiResponse({
    status: 200,
    description: 'Order items retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderItem' },
        },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async getOrderItems(
    @Query() getOrderItemsDto: GetOrderItemsDto,
  ): Promise<PaginatedResponse<OrderItem>> {
    return this.orderTrackingService.getOrderItems(getOrderItemsDto);
  }

  @Get('tracking-history')
  @Permissions(AccessPermissions.ReadOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tracking history for order items with optional visibility filtering' })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.TRACKING_HISTORY_FETCHED,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderItemTracking' },
        },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async getTrackingHistory(
    @Query() getHistoryDto: GetTrackingHistoryDto,
  ): Promise<PaginatedResponse<OrderItemTracking>> {
    return this.orderTrackingService.getTrackingHistory(getHistoryDto);
  }

  @Delete('order-item/:orderItemId')
  @Permissions(AccessPermissions.DeleteOrder)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an order item by ID' })
  @ApiParam({ name: 'orderItemId', description: 'Order item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_DELETED,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: ORDER_TRACKING_MESSAGES.ORDER_ITEM_DELETED },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND,
  })
  async deleteOrderItem(@Param('orderItemId') orderItemId: string) {
    return this.orderTrackingService.deleteOrderItem(orderItemId);
  }
}

