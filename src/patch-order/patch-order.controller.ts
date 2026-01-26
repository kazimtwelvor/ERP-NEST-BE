import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { File } from 'multer';
import { PatchOrderService } from './patch-order.service';
import { CreatePatchOrderDto } from './dto/create-patch-order.dto';
import { UpdatePatchOrderDto } from './dto/update-patch-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GetPatchOrdersDto } from './dto/get-patch-orders.dto';
import { GetAbandonedPatchOrdersDto } from './dto/get-abandoned-patch-orders.dto';
import { PatchOrder } from './entities/patch-order.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PATCH_ORDER_MESSAGES } from './messages/patch-order.messages';

@ApiTags('Patch Orders')
@ApiBearerAuth()
@Controller('patch-orders')
export class PatchOrderController {
  constructor(private readonly patchOrderService: PatchOrderService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerName: { type: 'string' },
        customerEmail: { type: 'string', format: 'email' },
        customerPhone: { type: 'string' },
        formType: {
          type: 'string',
          enum: [
            'contactForm',
            'quoteForm',
            'detailedForm',
            'callbackForm',
            'newsletterForm',
            'forCategoryFor',
          ],
        },
        shape: { type: 'string' },
        size: { type: 'string' },
        quantity: { type: 'integer' },
        backingType: { type: 'string' },
        embroideryCoverage: { type: 'string' },
        border: { type: 'string' },
        color: { type: 'string' },
        patchType: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      required: [
        'customerName',
        'customerEmail',
        'formType',
        'shape',
        'size',
        'quantity',
        'backingType',
        'embroideryCoverage',
        'border',
        'color',
        'patchType',
      ],
    },
  })
  @ApiOperation({ summary: 'Create a new patch order' })
  @ApiResponse({
    status: 201,
    description: PATCH_ORDER_MESSAGES.CREATED,
    type: PatchOrder,
  })
  async create(
    @Body() createPatchOrderDto: CreatePatchOrderDto,
    @UploadedFile() file?: File,
  ) {
    const imageData = file
      ? file.buffer.toString('base64')
      : createPatchOrderDto.image;
    return this.patchOrderService.create({
      ...createPatchOrderDto,
      image: imageData,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get patch orders with pagination, search, and filters',
  })
  @ApiResponse({ status: 200, description: PATCH_ORDER_MESSAGES.LIST_FETCHED })
  async findAll(
    @Query() getPatchOrdersDto: GetPatchOrdersDto,
  ): Promise<PaginatedResponse<PatchOrder>> {
    return this.patchOrderService.findAll(getPatchOrdersDto);
  }

  @Get('tracking-history/:patchOrderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tracking history for a patch order' })
  @ApiParam({ name: 'patchOrderId', description: 'Patch order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Tracking history fetched successfully',
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async getTrackingHistory(@Param('patchOrderId') patchOrderId: string) {
    return this.patchOrderService.getTrackingHistory(patchOrderId);
  }

  @Get('order/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a patch order by external order ID' })
  @ApiParam({
    name: 'orderId',
    description: 'External or client order identifier',
  })
  @ApiResponse({
    status: 200,
    description: PATCH_ORDER_MESSAGES.FETCHED,
    type: PatchOrder,
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async findByOrderId(@Param('orderId') orderId: string) {
    return this.patchOrderService.findByOrderId(orderId);
  }

  @Get('abandoned-patch-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all abandoned patch orders',
    description: 'Retrieves patch orders that have not been updated for 48 hours (or custom threshold) and are not in completed or cancelled status. These are classified as abandoned orders that require attention.',
  })
  @ApiResponse({
    status: 200,
    description: PATCH_ORDER_MESSAGES.ABANDONED_FETCHED,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/PatchOrder' },
        },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async getAbandonedPatchOrders(
    @Query() getAbandonedPatchOrdersDto: GetAbandonedPatchOrdersDto,
  ): Promise<PaginatedResponse<PatchOrder>> {
    return this.patchOrderService.getAbandonedPatchOrders(
      getAbandonedPatchOrdersDto.page,
      getAbandonedPatchOrdersDto.limit,
      getAbandonedPatchOrdersDto.formType,
      getAbandonedPatchOrdersDto.thresholdHours,
      getAbandonedPatchOrdersDto.sortBy,
      getAbandonedPatchOrdersDto.sortOrder,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a patch order by ID' })
  @ApiParam({ name: 'id', description: 'Patch order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: PATCH_ORDER_MESSAGES.FETCHED,
    type: PatchOrder,
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async findOne(@Param('id') id: string) {
    return this.patchOrderService.findOne(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update patch order status' })
  @ApiParam({ name: 'id', description: 'Patch order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: PATCH_ORDER_MESSAGES.STATUS_UPDATED,
    type: PatchOrder,
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.patchOrderService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/order-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update patch order order status' })
  @ApiParam({ name: 'id', description: 'Patch order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: PATCH_ORDER_MESSAGES.ORDER_STATUS_UPDATED,
    type: PatchOrder,
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.patchOrderService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a patch order' })
  @ApiParam({ name: 'id', description: 'Patch order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: PATCH_ORDER_MESSAGES.UPDATED,
    type: PatchOrder,
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async update(
    @Param('id') id: string,
    @Body() updatePatchOrderDto: UpdatePatchOrderDto,
  ) {
    return this.patchOrderService.update(id, updatePatchOrderDto);
  }

  @Get(':id/documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get documents for patch order' })
  @ApiParam({ name: 'id', description: 'Patch order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Documents fetched successfully',
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async getDocuments(@Param('id') id: string) {
    return this.patchOrderService.getDocuments(id);
  }

  @Patch(':id/documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update documents for patch order' })
  @ApiParam({ name: 'id', description: 'Patch order ID (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        digDocument: { type: 'string' },
        simDocument: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Documents updated successfully',
    type: PatchOrder,
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async updateDocuments(
    @Param('id') id: string,
    @Body() documents: { digDocument?: string; simDocument?: string },
  ) {
    return this.patchOrderService.updateDocuments(id, documents);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document for patch order' })
  @ApiParam({ name: 'id', description: 'Patch order ID (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: { type: 'string', enum: ['dig_document', 'sim_document'] },
      },
      required: ['file', 'documentType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document uploaded successfully',
    type: PatchOrder,
  })
  @ApiResponse({ status: 404, description: PATCH_ORDER_MESSAGES.NOT_FOUND })
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: File,
    @Body('documentType') documentType: 'dig_document' | 'sim_document',
  ) {
    return this.patchOrderService.uploadDocument(id, file, documentType);
  }
}
