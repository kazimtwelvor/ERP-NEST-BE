import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Product } from './entities/product.entity';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { GetInventoryItemsDto } from './dto/get-inventory-items.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { INVENTORY_MESSAGES } from './messages/inventory.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryItem)
    private readonly inventoryItemRepository: Repository<InventoryItem>,
  ) {}

  // ==================== PRODUCT METHODS ====================

  async createProduct(createProductDto: CreateProductDto): Promise<{ product: Product; message: string }> {
    if (createProductDto.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });
      if (existing) {
        throw new ConflictException(INVENTORY_MESSAGES.PRODUCT_SKU_EXISTS);
      }
    }

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    return {
      product: savedProduct,
      message: INVENTORY_MESSAGES.PRODUCT_CREATED,
    };
  }

  async findAllProducts(getProductsDto: GetProductsDto): Promise<PaginatedResponse<Product>> {
    const { query, page = 1, limit, sort = SortEnum.DESC } = getProductsDto;

    const qb = this.productRepository.createQueryBuilder('product');

    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(product.sku) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(product.description) LIKE LOWER(:query)', { query: `%${query}%` });
        }),
      );
    }

    qb.orderBy('product.createdAt', sort);

    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [products, total] = await qb.getManyAndCount();
    const lastPage = limit ? Math.ceil(total / limit) : 1;

    return {
      message: INVENTORY_MESSAGES.PRODUCT_LIST_FETCHED,
      data: products,
      page,
      total,
      lastPage,
    };
  }

  async findOneProduct(id: string): Promise<{ product: Product; message: string }> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(INVENTORY_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return {
      product,
      message: INVENTORY_MESSAGES.PRODUCT_FETCHED,
    };
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<{ product: Product; message: string }> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(INVENTORY_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existing) {
        throw new ConflictException(INVENTORY_MESSAGES.PRODUCT_SKU_EXISTS);
      }
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);

    return {
      product: updatedProduct,
      message: INVENTORY_MESSAGES.PRODUCT_UPDATED,
    };
  }

  async removeProduct(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['inventoryItems'],
    });

    if (!product) {
      throw new NotFoundException(INVENTORY_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.inventoryItems && product.inventoryItems.length > 0) {
      throw new BadRequestException(INVENTORY_MESSAGES.PRODUCT_HAS_INVENTORY);
    }

    await this.productRepository.remove(product);

    return {
      message: INVENTORY_MESSAGES.PRODUCT_DELETED,
    };
  }

  // ==================== INVENTORY ITEM METHODS ====================

  async createInventoryItem(createInventoryItemDto: CreateInventoryItemDto): Promise<{ inventoryItem: InventoryItem; message: string }> {
    // Check if inventory item already exists for this product
    const existing = await this.inventoryItemRepository.findOne({
      where: { productId: createInventoryItemDto.productId },
    });

    if (existing) {
      throw new ConflictException(INVENTORY_MESSAGES.INVENTORY_ITEM_EXISTS);
    }

    const product = await this.productRepository.findOne({
      where: { id: createInventoryItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(INVENTORY_MESSAGES.PRODUCT_NOT_FOUND);
    }

    const inventoryItem = this.inventoryItemRepository.create({
      ...createInventoryItemDto,
      product,
      quantity: createInventoryItemDto.quantity || 0,
    });

    const savedItem = await this.inventoryItemRepository.save(inventoryItem);
    const itemWithProduct = await this.inventoryItemRepository.findOne({
      where: { id: savedItem.id },
      relations: ['product'],
    });

    return {
      inventoryItem: itemWithProduct!,
      message: INVENTORY_MESSAGES.INVENTORY_ITEM_CREATED,
    };
  }

  async findAllInventoryItems(getInventoryItemsDto: GetInventoryItemsDto): Promise<PaginatedResponse<InventoryItem>> {
    const { query, page = 1, limit, productId, lowStock, sort = SortEnum.DESC } = getInventoryItemsDto;

    const qb = this.inventoryItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product');

    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(product.sku) LIKE LOWER(:query)', { query: `%${query}%` });
        }),
      );
    }

    if (productId) {
      qb.andWhere('item.productId = :productId', { productId });
    }

    if (lowStock) {
      qb.andWhere('item.quantity <= item.reorderLevel OR item.reorderLevel IS NULL');
    }

    qb.orderBy('item.createdAt', sort);

    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [items, total] = await qb.getManyAndCount();
    const lastPage = limit ? Math.ceil(total / limit) : 1;

    return {
      message: INVENTORY_MESSAGES.INVENTORY_ITEM_LIST_FETCHED,
      data: items,
      page,
      total,
      lastPage,
    };
  }

  async findOneInventoryItem(id: string): Promise<{ inventoryItem: InventoryItem; message: string }> {
    const inventoryItem = await this.inventoryItemRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!inventoryItem) {
      throw new NotFoundException(INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND);
    }

    return {
      inventoryItem,
      message: INVENTORY_MESSAGES.INVENTORY_ITEM_FETCHED,
    };
  }

  async updateInventoryItem(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<{ inventoryItem: InventoryItem; message: string }> {
    const inventoryItem = await this.inventoryItemRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!inventoryItem) {
      throw new NotFoundException(INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND);
    }

    if (updateInventoryItemDto.productId && updateInventoryItemDto.productId !== inventoryItem.productId) {
      const existing = await this.inventoryItemRepository.findOne({
        where: { productId: updateInventoryItemDto.productId },
      });

      if (existing) {
        throw new ConflictException(INVENTORY_MESSAGES.INVENTORY_ITEM_EXISTS);
      }

      const product = await this.productRepository.findOne({
        where: { id: updateInventoryItemDto.productId },
      });

      if (!product) {
        throw new NotFoundException(INVENTORY_MESSAGES.PRODUCT_NOT_FOUND);
      }

      inventoryItem.product = product;
      delete (updateInventoryItemDto as any).productId;
    }

    Object.assign(inventoryItem, updateInventoryItemDto);
    const updatedItem = await this.inventoryItemRepository.save(inventoryItem);
    const itemWithProduct = await this.inventoryItemRepository.findOne({
      where: { id: updatedItem.id },
      relations: ['product'],
    });

    return {
      inventoryItem: itemWithProduct!,
      message: INVENTORY_MESSAGES.INVENTORY_ITEM_UPDATED,
    };
  }

  async removeInventoryItem(id: string): Promise<{ message: string }> {
    const inventoryItem = await this.inventoryItemRepository.findOne({
      where: { id },
    });

    if (!inventoryItem) {
      throw new NotFoundException(INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND);
    }

    await this.inventoryItemRepository.remove(inventoryItem);

    return {
      message: INVENTORY_MESSAGES.INVENTORY_ITEM_DELETED,
    };
  }

  // ==================== STOCK ADJUSTMENT ====================

  async adjustStock(adjustStockDto: AdjustStockDto): Promise<{ inventoryItem: InventoryItem; message: string }> {
    const inventoryItem = await this.inventoryItemRepository.findOne({
      where: { id: adjustStockDto.inventoryItemId },
      relations: ['product'],
    });

    if (!inventoryItem) {
      throw new NotFoundException(INVENTORY_MESSAGES.INVENTORY_ITEM_NOT_FOUND);
    }

    const newQuantity = inventoryItem.quantity + adjustStockDto.quantity;

    if (newQuantity < 0) {
      throw new BadRequestException(INVENTORY_MESSAGES.INSUFFICIENT_STOCK);
    }

    inventoryItem.quantity = newQuantity;
    const updatedItem = await this.inventoryItemRepository.save(inventoryItem);
    const itemWithProduct = await this.inventoryItemRepository.findOne({
      where: { id: updatedItem.id },
      relations: ['product'],
    });

    return {
      inventoryItem: itemWithProduct!,
      message: INVENTORY_MESSAGES.STOCK_ADJUSTED,
    };
  }
}
