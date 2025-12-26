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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { GetInventoryItemsDto } from './dto/get-inventory-items.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Product } from './entities/product.entity';
import { InventoryItem } from './entities/inventory-item.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AccessPermissions } from '../common/enums/access-permissions.enum';
import { INVENTORY_MESSAGES } from './messages/inventory.messages';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ==================== PRODUCT ENDPOINTS ====================

  @Post('products')
  // @Permissions(AccessPermissions.CreateInventory)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: INVENTORY_MESSAGES.PRODUCT_CREATED, type: Product })
  @ApiResponse({ status: 409, description: INVENTORY_MESSAGES.PRODUCT_SKU_EXISTS })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.inventoryService.createProduct(createProductDto);
  }

  @Get('products')
  // @Permissions(AccessPermissions.ReadInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products with pagination and search' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.PRODUCT_LIST_FETCHED })
  async findAllProducts(@Query() getProductsDto: GetProductsDto): Promise<PaginatedResponse<Product>> {
    return this.inventoryService.findAllProducts(getProductsDto);
  }

  @Get('products/:id')
  // @Permissions(AccessPermissions.ReadInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.PRODUCT_FETCHED, type: Product })
  @ApiResponse({ status: 404, description: INVENTORY_MESSAGES.PRODUCT_NOT_FOUND })
  async findOneProduct(@Param('id') id: string) {
    return this.inventoryService.findOneProduct(id);
  }

  @Patch('products/:id')
  // @Permissions(AccessPermissions.UpdateInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.PRODUCT_UPDATED, type: Product })
  @ApiResponse({ status: 404, description: INVENTORY_MESSAGES.PRODUCT_NOT_FOUND })
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.inventoryService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  // @Permissions(AccessPermissions.DeleteInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.PRODUCT_DELETED })
  @ApiResponse({ status: 404, description: INVENTORY_MESSAGES.PRODUCT_NOT_FOUND })
  async removeProduct(@Param('id') id: string) {
    return this.inventoryService.removeProduct(id);
  }

  // ==================== INVENTORY ITEM ENDPOINTS ====================

  @Post('items')
  // @Permissions(AccessPermissions.CreateInventory)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({ status: 201, description: INVENTORY_MESSAGES.INVENTORY_ITEM_CREATED, type: InventoryItem })
  @ApiResponse({ status: 409, description: INVENTORY_MESSAGES.INVENTORY_ITEM_EXISTS })
  async createInventoryItem(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.createInventoryItem(createInventoryItemDto);
  }

  @Get('items')
  // @Permissions(AccessPermissions.ReadInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all inventory items with pagination and search' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.INVENTORY_ITEM_LIST_FETCHED })
  async findAllInventoryItems(@Query() getInventoryItemsDto: GetInventoryItemsDto): Promise<PaginatedResponse<InventoryItem>> {
    return this.inventoryService.findAllInventoryItems(getInventoryItemsDto);
  }

  @Get('items/low-stock')
  // @Permissions(AccessPermissions.ReadInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get low stock inventory items' })
  @ApiResponse({ status: 200, description: 'Low stock items fetched successfully' })
  async findLowStockItems(@Query() getInventoryItemsDto: GetInventoryItemsDto): Promise<PaginatedResponse<InventoryItem>> {
    return this.inventoryService.findAllInventoryItems({ ...getInventoryItemsDto, lowStock: true });
  }

  @Get('items/:id')
  // @Permissions(AccessPermissions.ReadInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID (UUID)' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.INVENTORY_ITEM_FETCHED, type: InventoryItem })
  @ApiResponse({ status: 404, description: INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND })
  async findOneInventoryItem(@Param('id') id: string) {
    return this.inventoryService.findOneInventoryItem(id);
  }

  @Patch('items/:id')
  // @Permissions(AccessPermissions.UpdateInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID (UUID)' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.INVENTORY_ITEM_UPDATED, type: InventoryItem })
  @ApiResponse({ status: 404, description: INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND })
  async updateInventoryItem(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryService.updateInventoryItem(id, updateInventoryItemDto);
  }

  @Delete('items/:id')
  // @Permissions(AccessPermissions.DeleteInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID (UUID)' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.INVENTORY_ITEM_DELETED })
  @ApiResponse({ status: 404, description: INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND })
  async removeInventoryItem(@Param('id') id: string) {
    return this.inventoryService.removeInventoryItem(id);
  }

  // ==================== STOCK ADJUSTMENT ====================

  @Post('adjust-stock')
  // @Permissions(AccessPermissions.UpdateInventory)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust stock (add or remove)' })
  @ApiResponse({ status: 200, description: INVENTORY_MESSAGES.STOCK_ADJUSTED, type: InventoryItem })
  @ApiResponse({ status: 400, description: INVENTORY_MESSAGES.INSUFFICIENT_STOCK })
  @ApiResponse({ status: 404, description: INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND })
  async adjustStock(@Body() adjustStockDto: AdjustStockDto) {
    return this.inventoryService.adjustStock(adjustStockDto);
  }
}
