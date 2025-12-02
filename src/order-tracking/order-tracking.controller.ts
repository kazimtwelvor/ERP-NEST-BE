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

@ApiTags('Order Tracking')
@ApiBearerAuth()
@Controller('order-tracking')
export class OrderTrackingController {
  constructor(private readonly orderTrackingService: OrderTrackingService) {}

  @Post('sync-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync orders from external store APIs' })
  @ApiResponse({
    status: 200,
    description: 'Orders synced successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid store name or API error',
  })
  async syncOrders(@Body() syncOrdersDto: SyncOrdersDto) {
    return this.orderTrackingService.syncOrders(syncOrdersDto);
  }

  @Post('custom-sync-order')
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate QR code for an order item' })
  @ApiParam({ name: 'orderItemId', description: 'Order item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'QR code generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order item not found',
  })
  async generateQRCode(@Param('orderItemId') orderItemId: string) {
    return this.orderTrackingService.generateQRCode(orderItemId);
  }

  @Get('order-item/qr/:qrCode')
  @ApiOperation({ summary: 'Get order item by QR code with optional visibility filtering' })
  @ApiParam({ name: 'qrCode', description: 'QR code of the order item' })
  @ApiQuery({ name: 'roleId', required: false, description: 'Role ID for visibility check' })
  @ApiQuery({ name: 'roleName', required: false, description: 'Role name for visibility check' })
  @ApiQuery({ name: 'roleIds', required: false, description: 'Array of role IDs for visibility check', type: [String] })
  @ApiQuery({ name: 'roleNames', required: false, description: 'Array of role names for visibility check', type: [String] })
  @ApiResponse({
    status: 200,
    description: 'Order item retrieved successfully',
    type: OrderItem,
  })
  @ApiResponse({
    status: 404,
    description: 'QR code not found or access denied',
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in order item to a department' })
  @ApiResponse({
    status: 200,
    description: 'Order item checked in successfully',
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: 'Order item, department, or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Order item already checked in or invalid request',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password',
  })
  async checkIn(@Body() checkInDto: CheckInOrderItemDto) {
    return this.orderTrackingService.checkIn(checkInDto);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check out order item from a department' })
  @ApiResponse({
    status: 200,
    description: 'Order item checked out successfully',
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: 'Order item, department, or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Order item not checked in or invalid request',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password',
  })
  async checkOut(@Body() checkOutDto: CheckOutOrderItemDto) {
    return this.orderTrackingService.checkOut(checkOutDto);
  }

  @Post('update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order item status (e.g., to in-progress)' })
  @ApiResponse({
    status: 200,
    description: 'Order item status updated successfully',
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: 'Order item, department, or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password',
  })
  async updateStatus(@Body() updateStatusDto: UpdateStatusDto) {
    return this.orderTrackingService.updateStatus(updateStatusDto);
  }

  @Post('return-to-stage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return order item to a previous stage (e.g., after quality control failure)' })
  @ApiResponse({
    status: 200,
    description: 'Order item returned to previous stage successfully',
    type: OrderItemTracking,
  })
  @ApiResponse({
    status: 404,
    description: 'Order item, department, or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid return status or department',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password',
  })
  async returnToStage(@Body() returnToStageDto: ReturnToStageDto) {
    return this.orderTrackingService.returnToStage(returnToStageDto);
  }

  @Get('order-items')
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
  @ApiOperation({ summary: 'Get tracking history for order items with optional visibility filtering' })
  @ApiResponse({
    status: 200,
    description: 'Tracking history retrieved successfully',
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an order item by ID' })
  @ApiParam({ name: 'orderItemId', description: 'Order item ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order item deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order item deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Order item not found',
  })
  async deleteOrderItem(@Param('orderItemId') orderItemId: string) {
    return this.orderTrackingService.deleteOrderItem(orderItemId);
  }
}

