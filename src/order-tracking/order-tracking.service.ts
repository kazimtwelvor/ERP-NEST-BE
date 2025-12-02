import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemTracking } from './entities/order-item-tracking.entity';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';
import { CheckInOrderItemDto } from './dto/check-in-order-item.dto';
import { CheckOutOrderItemDto } from './dto/check-out-order-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { GetTrackingHistoryDto } from './dto/get-tracking-history.dto';
import { GetOrderItemsDto } from './dto/get-order-items.dto';
import { SyncOrdersDto, StoreName } from './dto/sync-orders.dto';
import { ReturnToStageDto } from './dto/return-to-stage.dto';
import { CustomSyncOrderItemsDto } from './dto/custom-sync-order-items.dto';
import { ORDER_TRACKING_MESSAGES } from './messages/order-tracking.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { DepartmentStatus, StatusTransitions } from './enums/department-status.enum';

@Injectable()
export class OrderTrackingService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderItemTracking)
    private readonly trackingRepository: Repository<OrderItemTracking>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate QR code for an order item
   */
  async generateQRCode(orderItemId: string): Promise<{ qrCode: string; message: string }> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId },
    });

    if (!orderItem) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND);
    }

    // Generate unique QR code using order item ID and a random hash
    const hash = crypto.randomBytes(16).toString('hex');
    const qrCode = `ORDER_ITEM_${orderItem.id}_${hash}`;

    orderItem.qrCode = qrCode;
    await this.orderItemRepository.save(orderItem);

    return {
      qrCode,
      message: ORDER_TRACKING_MESSAGES.QR_CODE_GENERATED,
    };
  }

  /**
   * Verify user password
   */
  private async verifyUserPassword(userId: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ORDER_TRACKING_MESSAGES.INVALID_PASSWORD);
    }

    return user;
  }

  /**
   * Check in order item to a department
   */
  async checkIn(
    checkInDto: CheckInOrderItemDto,
  ): Promise<{ tracking: OrderItemTracking; message: string }> {
    const user = await this.verifyUserPassword(checkInDto.userId, checkInDto.password);

    const orderItem = await this.orderItemRepository.findOne({
      where: { qrCode: checkInDto.qrCode },
      relations: ['trackingHistory'],
    });

    if (!orderItem) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.QR_CODE_NOT_FOUND);
    }

    const department = await this.departmentRepository.findOne({
      where: { id: checkInDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // Check if item is currently checked in to THIS specific department
    // Item can be checked in if:
    // 1. Status is 'pending' (first time)
    // 2. Status is 'checked-out' and this department matches the handed over department
    // 3. Status is 'checked-in' or 'in-progress' but in a DIFFERENT department
    
    if (orderItem.currentStatus === 'checked-in' || orderItem.currentStatus === 'in-progress') {
      // If item is already in a department, verify it's not the same department
      if (orderItem.currentDepartmentId === checkInDto.departmentId) {
        throw new BadRequestException(ORDER_TRACKING_MESSAGES.ALREADY_CHECKED_IN);
      }
      // If item is in a different department, it should be checked out first
      // But we'll allow direct check-in to new department (item is moving)
    }
    
    if (orderItem.currentStatus === 'checked-out') {
      if (orderItem.handedOverDepartmentId && orderItem.handedOverDepartmentId !== checkInDto.departmentId) {
        throw new BadRequestException(
          `Order item is being handed over to a different department. Expected department: ${orderItem.handedOverDepartmentId}`,
        );
      }
    }
    
    // If status is 'pending', allow check-in (first time)

    // Create tracking record
    const previousStatus = orderItem.currentStatus;
    const initialDepartmentStatus = checkInDto.departmentStatus || null;
    
    const tracking = this.trackingRepository.create({
      orderItemId: orderItem.id,
      departmentId: checkInDto.departmentId,
      userId: user.id,
      actionType: 'check-in',
      status: 'checked-in',
      previousStatus,
      preparationType: checkInDto.preparationType || null,
      departmentStatus: initialDepartmentStatus,
      notes: checkInDto.notes,
    });

    await this.trackingRepository.save(tracking);

    // Update order item status
    if (orderItem.currentDepartmentId) {
      orderItem.lastDepartmentId = orderItem.currentDepartmentId;
    }
    orderItem.currentStatus = 'checked-in';
    orderItem.currentDepartmentId = checkInDto.departmentId;
    orderItem.preparationType = checkInDto.preparationType || null;
    orderItem.currentDepartmentStatus = initialDepartmentStatus;
    orderItem.handedOverDepartmentId = null;
    await this.orderItemRepository.save(orderItem);

    // Load relations for response
    await this.trackingRepository.findOne({
      where: { id: tracking.id },
      relations: ['orderItem', 'department', 'user'],
    });

    return {
      tracking,
      message: ORDER_TRACKING_MESSAGES.CHECKED_IN,
    };
  }

  /**
   * Check out order item from a department
   */
  async checkOut(
    checkOutDto: CheckOutOrderItemDto,
  ): Promise<{ tracking: OrderItemTracking; message: string }> {
    // Verify user password
    const user = await this.verifyUserPassword(checkOutDto.userId, checkOutDto.password);

    // Find order item by QR code
    const orderItem = await this.orderItemRepository.findOne({
      where: { qrCode: checkOutDto.qrCode },
    });

    if (!orderItem) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.QR_CODE_NOT_FOUND);
    }

    // Verify department exists
    const department = await this.departmentRepository.findOne({
      where: { id: checkOutDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // Verify item is currently checked in to THIS specific department
    // Item must be in 'checked-in' or 'in-progress' status AND in this department
    if (orderItem.currentStatus !== 'checked-in' && orderItem.currentStatus !== 'in-progress') {
      throw new BadRequestException('Order item must be checked in or in-progress to check out');
    }

    if (orderItem.currentDepartmentId !== checkOutDto.departmentId) {
      throw new BadRequestException(
        `Order item is currently in a different department. Current department: ${orderItem.currentDepartmentId || 'none'}`,
      );
    }

    const handedOverDepartment = await this.departmentRepository.findOne({
      where: { id: checkOutDto.handedOverDepartmentId },
    });

    if (!handedOverDepartment) {
      throw new NotFoundException('Handed over department not found');
    }

    // Create tracking record
    const previousStatus = orderItem.currentStatus;
    const tracking = this.trackingRepository.create({
      orderItemId: orderItem.id,
      departmentId: checkOutDto.departmentId,
      userId: user.id,
      actionType: 'check-out',
      status: 'checked-out',
      previousStatus,
      notes: checkOutDto.notes,
    });

    await this.trackingRepository.save(tracking);

    // Update order item status
    orderItem.lastDepartmentId = orderItem.currentDepartmentId; // Current becomes last
    orderItem.currentStatus = 'checked-out';
    orderItem.currentDepartmentId = null;
    orderItem.handedOverDepartmentId = checkOutDto.handedOverDepartmentId; // Set handed over department
    await this.orderItemRepository.save(orderItem);

    // Load relations for response
    await this.trackingRepository.findOne({
      where: { id: tracking.id },
      relations: ['orderItem', 'department', 'user'],
    });

    return {
      tracking,
      message: ORDER_TRACKING_MESSAGES.CHECKED_OUT,
    };
  }

  /**
   * Update order item status (e.g., to in-progress)
   */
  async updateStatus(
    updateStatusDto: UpdateStatusDto,
  ): Promise<{ tracking: OrderItemTracking; message: string }> {
    // Verify user password
    const user = await this.verifyUserPassword(updateStatusDto.userId, updateStatusDto.password);

    // Find order item by QR code
    const orderItem = await this.orderItemRepository.findOne({
      where: { qrCode: updateStatusDto.qrCode },
    });

    if (!orderItem) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.QR_CODE_NOT_FOUND);
    }

    // Verify department exists
    const department = await this.departmentRepository.findOne({
      where: { id: updateStatusDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'checked-in': ['in-progress', 'checked-out'],
      'in-progress': ['in-progress', 'checked-out'],
      'checked-out': ['checked-in'],
      'pending': ['checked-in'],
      'completed': ['shipped'],
      'shipped': ['delivered'],
      'delivered': [], // Cannot transition from delivered
    };

    const allowedStatuses = validTransitions[orderItem.currentStatus] || [];
    if (!allowedStatuses.includes(updateStatusDto.status)) {
      throw new BadRequestException(ORDER_TRACKING_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    // Verify department context for status updates
    if (updateStatusDto.status === 'in-progress') {
      // To set in-progress, item must be checked-in to THIS department
      if (orderItem.currentStatus !== 'checked-in' && orderItem.currentStatus !== 'in-progress') {
        throw new BadRequestException('Order item must be checked-in before setting to in-progress');
      }
      if (orderItem.currentDepartmentId !== updateStatusDto.departmentId) {
        throw new BadRequestException(
          `Order item is not checked in to this department. Current department: ${orderItem.currentDepartmentId || 'none'}`,
        );
      }
    }

    if (updateStatusDto.departmentStatus) {
      const currentDeptStatus = orderItem.currentDepartmentStatus as DepartmentStatus;
      if (currentDeptStatus) {
        const validNextStatuses = StatusTransitions[currentDeptStatus] || [];
        const newDeptStatus = updateStatusDto.departmentStatus as DepartmentStatus;
        if (!validNextStatuses.includes(newDeptStatus)) {
          throw new BadRequestException(
            `Invalid department status transition from ${currentDeptStatus} to ${newDeptStatus}. Valid next statuses: ${validNextStatuses.join(', ')}`,
          );
        }
      }
    }

    // Create tracking record
    const previousStatus = orderItem.currentStatus;
    const previousDepartmentStatus = orderItem.currentDepartmentStatus;
    const tracking = this.trackingRepository.create({
      orderItemId: orderItem.id,
      departmentId: updateStatusDto.departmentId,
      userId: user.id,
      actionType: 'status-update',
      status: updateStatusDto.status,
      previousStatus,
      preparationType: updateStatusDto.preparationType || null,
      departmentStatus: updateStatusDto.departmentStatus || null,
      notes: updateStatusDto.notes,
    });

    await this.trackingRepository.save(tracking);

    // Update order item status
    orderItem.currentStatus = updateStatusDto.status;
    if (updateStatusDto.status === 'checked-in' || updateStatusDto.status === 'in-progress') {
      orderItem.currentDepartmentId = updateStatusDto.departmentId;
    }
    // Update preparation type if provided
    if (updateStatusDto.preparationType) {
      orderItem.preparationType = updateStatusDto.preparationType;
    }
    // Update department status if provided
    if (updateStatusDto.departmentStatus) {
      orderItem.currentDepartmentStatus = updateStatusDto.departmentStatus;
    }
    await this.orderItemRepository.save(orderItem);

    // Load relations for response
    await this.trackingRepository.findOne({
      where: { id: tracking.id },
      relations: ['orderItem', 'department', 'user'],
    });

    return {
      tracking,
      message: ORDER_TRACKING_MESSAGES.STATUS_UPDATED,
    };
  }

  /**
   * Return order item to a previous stage (e.g., after quality control failure)
   */
  async returnToStage(
    returnToStageDto: ReturnToStageDto,
  ): Promise<{ tracking: OrderItemTracking; message: string }> {
    // Verify user password
    const user = await this.verifyUserPassword(returnToStageDto.userId, returnToStageDto.password);

    // Find order item by QR code
    const orderItem = await this.orderItemRepository.findOne({
      where: { qrCode: returnToStageDto.qrCode },
    });

    if (!orderItem) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.QR_CODE_NOT_FOUND);
    }

    // Verify department exists
    const department = await this.departmentRepository.findOne({
      where: { id: returnToStageDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // Validate that return status is valid (can return to any previous stage)
    const validReturnStatuses = [
      DepartmentStatus.CUTTING_IN_PROGRESS,
      DepartmentStatus.EMBROIDERY_IN_PROGRESS,
      DepartmentStatus.RIVETS_INSTALLATION_IN_PROGRESS,
      DepartmentStatus.STITCHING_IN_PROGRESS,
      DepartmentStatus.PACKING_IN_PROGRESS,
    ];

    if (!validReturnStatuses.includes(returnToStageDto.returnToStatus)) {
      throw new BadRequestException(
        `Cannot return to status ${returnToStageDto.returnToStatus}. Valid return statuses: ${validReturnStatuses.join(', ')}`,
      );
    }

    // Create tracking record for return
    const previousStatus = orderItem.currentStatus;
    const previousDepartmentStatus = orderItem.currentDepartmentStatus;
    
    const tracking = this.trackingRepository.create({
      orderItemId: orderItem.id,
      departmentId: returnToStageDto.departmentId,
      userId: user.id,
      actionType: 'status-update',
      status: 'in-progress',
      previousStatus,
      departmentStatus: returnToStageDto.returnToStatus,
      notes: `Returned to ${returnToStageDto.returnToStatus}. Reason: ${returnToStageDto.reason || 'Quality issue'}. ${returnToStageDto.notes || ''}`,
    });

    await this.trackingRepository.save(tracking);

    // Update order item - return to specified stage
    orderItem.currentStatus = 'in-progress';
    orderItem.currentDepartmentStatus = returnToStageDto.returnToStatus;
    // Note: currentDepartmentId should be set to the department handling the return
    // This might need to be determined based on the return status
    await this.orderItemRepository.save(orderItem);

    // Load relations for response
    await this.trackingRepository.findOne({
      where: { id: tracking.id },
      relations: ['orderItem', 'department', 'user'],
    });

    return {
      tracking,
      message: `Order item returned to ${returnToStageDto.returnToStatus} successfully`,
    };
  }

  /**
   * Get tracking history for order items with visibility filtering
   */
  async getTrackingHistory(
    getHistoryDto: GetTrackingHistoryDto,
  ): Promise<PaginatedResponse<OrderItemTracking>> {
    const page = getHistoryDto.page || 1;
    const limit = getHistoryDto.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<OrderItemTracking> = {};

    if (getHistoryDto.orderItemId) {
      where.orderItemId = getHistoryDto.orderItemId;
    } else if (getHistoryDto.qrCode) {
      const orderItem = await this.orderItemRepository.findOne({
        where: { qrCode: getHistoryDto.qrCode },
      });
      if (orderItem) {
        where.orderItemId = orderItem.id;
      } else {
        // Return empty result if QR code not found
        return {
          message: ORDER_TRACKING_MESSAGES.TRACKING_HISTORY_FETCHED,
          data: [],
          page,
          total: 0,
          lastPage: 0,
        };
      }
    }

    if (getHistoryDto.departmentId) {
      where.departmentId = getHistoryDto.departmentId;
    }

    // If visibility filtering is needed, fetch more items to account for filtering
    const fetchLimit = 
      getHistoryDto.roleId || getHistoryDto.roleName || getHistoryDto.roleIds || getHistoryDto.roleNames
        ? limit * 5 // Fetch 5x more if filtering by visibility
        : limit;

    const [allData, total] = await this.trackingRepository.findAndCount({
      where,
      relations: ['orderItem', 'department', 'user'],
      order: { createdAt: 'DESC' },
      skip: 0, // Start from beginning when filtering
      take: fetchLimit,
    });

    // Filter by visibility if role filters are provided
    let filteredData = allData;
    if (
      getHistoryDto.roleId ||
      getHistoryDto.roleName ||
      getHistoryDto.roleIds ||
      getHistoryDto.roleNames
    ) {
      filteredData = allData.filter((tracking) => {
        if (!tracking.orderItem) {
          return false;
        }
        return this.isItemVisible(
          tracking.orderItem,
          getHistoryDto.roleId,
          getHistoryDto.roleName,
          getHistoryDto.roleIds,
          getHistoryDto.roleNames,
        );
      });
    }

    // Apply pagination after filtering
    const paginatedData = filteredData.slice(skip, skip + limit);
    const filteredTotal = filteredData.length;
    const lastPage = Math.ceil(filteredTotal / limit);

    return {
      message: ORDER_TRACKING_MESSAGES.TRACKING_HISTORY_FETCHED,
      data: paginatedData,
      page,
      total: filteredTotal,
      lastPage,
    };
  }

  /**
   * Get order item by QR code with optional visibility filtering
   */
  async getOrderItemByQRCode(
    qrCode: string,
    roleId?: string,
    roleName?: string,
    roleIds?: string[],
    roleNames?: string[],
  ): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { qrCode },
      relations: ['trackingHistory'],
    });

    if (!orderItem) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.QR_CODE_NOT_FOUND);
    }

    // Check visibility if role filters are provided
    if (roleId || roleName || roleIds || roleNames) {
      if (!this.isItemVisible(orderItem, roleId, roleName, roleIds, roleNames)) {
        throw new NotFoundException(
          'Order item not found or access denied',
        );
      }
    }

    return orderItem;
  }

  /**
   * Sync orders from external API stores
   */
  async syncOrders(syncOrdersDto: SyncOrdersDto): Promise<{ message: string; synced: number }> {
    let apiUrl: string;
    let storeName: string;

    switch (syncOrdersDto.storeName) {
      case StoreName.FINEYST_JACKETS:
        apiUrl = this.configService.get<string>('FINEYST_JACKETS_API_URL') || '';
        storeName = 'fineyst-jackets';
        break;
      case StoreName.FINEYST_PATCHES:
        apiUrl = this.configService.get<string>('FINEYST_PATCHES_API_URL') || '';
        storeName = 'fineyst-patches';
        break;
      default:
        throw new BadRequestException('Invalid store name');
    }

    if (!apiUrl) {
      throw new BadRequestException(`API URL not configured for ${storeName}`);
    }

    try {
      // Fetch orders from external API
      const response = await fetch(`${apiUrl}/erp-orders?limit=1000&page=1`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const orders = data.orders || [];

      let syncedCount = 0;

      // Process each order and its items
      for (const order of orders) {
        const orderItems = order.orderItems || [];

        for (const item of orderItems) {
          // Check if order item already exists
          const existingItem = await this.orderItemRepository.findOne({
            where: {
              externalOrderId: order.id,
              externalItemId: item.id,
            },
          });

          if (existingItem) {
            // Update existing item
            existingItem.productName = item.productName || item.product?.name || null;
            existingItem.sku = item.sku || item.product?.sku || null;
            existingItem.quantity = item.quantity || 1;
            existingItem.isLeather = item.isLeather || item.product?.isLeather || false;
            existingItem.isPattern = item.isPattern || item.product?.isPattern || false;
            await this.orderItemRepository.save(existingItem);
          } else {
            // Create new order item
            const orderItem = this.orderItemRepository.create({
              externalOrderId: order.id,
              externalItemId: item.id,
              storeName,
              productName: item.productName || item.product?.name || null,
              sku: item.sku || item.product?.sku || null,
              quantity: item.quantity || 1,
              isLeather: item.isLeather || item.product?.isLeather || false,
              isPattern: item.isPattern || item.product?.isPattern || false,
              currentStatus: 'pending',
            });

            await this.orderItemRepository.save(orderItem);

            const hash = crypto.randomBytes(16).toString('hex');
            orderItem.qrCode = `ORDER_ITEM_${orderItem.id}_${hash}`;
            await this.orderItemRepository.save(orderItem);

            syncedCount++;
          }
        }
      }

      return {
        message: ORDER_TRACKING_MESSAGES.ORDERS_SYNCED,
        synced: syncedCount,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to sync orders from ${storeName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Validate visibility status - check if roleIds and roleNames exist
   */
  private async validateVisibilityStatus(
    visibilityStatus: { roleIds: string[]; roleNames: string[] },
  ): Promise<void> {
    // Validate role IDs
    if (visibilityStatus.roleIds && visibilityStatus.roleIds.length > 0) {
      const roles = await this.roleRepository.findBy({
        id: In(visibilityStatus.roleIds),
      });
      if (roles.length !== visibilityStatus.roleIds.length) {
        const foundIds = roles.map((r) => r.id);
        const missingIds = visibilityStatus.roleIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new BadRequestException(
          `Invalid role IDs: ${missingIds.join(', ')}`,
        );
      }
    }

    // Validate role names
    if (visibilityStatus.roleNames && visibilityStatus.roleNames.length > 0) {
      const roles = await this.roleRepository.findBy({
        name: In(visibilityStatus.roleNames),
      });
      if (roles.length !== visibilityStatus.roleNames.length) {
        const foundNames = roles.map((r) => r.name);
        const missingNames = visibilityStatus.roleNames.filter(
          (name) => !foundNames.includes(name),
        );
        throw new BadRequestException(
          `Invalid role names: ${missingNames.join(', ')}`,
        );
      }
    }
  }

  /**
   * Check if order item is visible to the provided role(s)
   */
  private isItemVisible(
    orderItem: OrderItem,
    roleId?: string,
    roleName?: string,
    roleIds?: string[],
    roleNames?: string[],
  ): boolean {
    // If no visibility status is set, item is visible to all
    if (!orderItem.visibilityStatus) {
      return true;
    }

    const visibility = orderItem.visibilityStatus;

    // Check single role ID
    if (roleId && visibility.roleIds?.includes(roleId)) {
      return true;
    }

    // Check single role name
    if (roleName && visibility.roleNames?.includes(roleName)) {
      return true;
    }

    // Check multiple role IDs
    if (roleIds && roleIds.length > 0) {
      const hasMatchingRoleId = roleIds.some((id) =>
        visibility.roleIds?.includes(id),
      );
      if (hasMatchingRoleId) {
        return true;
      }
    }

    // Check multiple role names
    if (roleNames && roleNames.length > 0) {
      const hasMatchingRoleName = roleNames.some((name) =>
        visibility.roleNames?.includes(name),
      );
      if (hasMatchingRoleName) {
        return true;
      }
    }

    // No match found
    return false;
  }

  /**
   * Custom sync order items - allows syncing individual or multiple order items directly
   */
  async customSyncOrderItems(
    customSyncDto: CustomSyncOrderItemsDto,
  ): Promise<{ message: string; synced: number; updated: number }> {
    // Validate visibility status if provided
    if (customSyncDto.visibilityStatus) {
      await this.validateVisibilityStatus(customSyncDto.visibilityStatus);
    }

    let syncedCount = 0;
    let updatedCount = 0;

    // Process each order item
    for (const itemData of customSyncDto.orderItems) {
      // Check if order item already exists
      const existingItem = await this.orderItemRepository.findOne({
        where: {
          externalOrderId: itemData.externalOrderId,
          externalItemId: itemData.externalItemId,
        },
      });

      if (existingItem) {
        // Update existing item
        if (itemData.productName !== undefined) {
          existingItem.productName = itemData.productName || null;
        }
        if (itemData.sku !== undefined) {
          existingItem.sku = itemData.sku || null;
        }
        existingItem.quantity = itemData.quantity || 1;
        existingItem.isLeather = itemData.isLeather ?? false;
        existingItem.isPattern = itemData.isPattern ?? false;
        
        if (itemData.currentDepartmentStatus !== undefined) {
          existingItem.currentDepartmentStatus = itemData.currentDepartmentStatus || null;
        }
        
        // Update visibility status if provided
        if (customSyncDto.visibilityStatus) {
          existingItem.visibilityStatus = customSyncDto.visibilityStatus;
        }
        
        await this.orderItemRepository.save(existingItem);
        updatedCount++;
      } else {
        // Create new order item
        const orderItemData: Partial<OrderItem> = {
          externalOrderId: itemData.externalOrderId,
          externalItemId: itemData.externalItemId,
          storeName: customSyncDto.storeName,
          productName: itemData.productName ?? null,
          sku: itemData.sku ?? null,
          quantity: itemData.quantity || 1,
          isLeather: itemData.isLeather ?? false,
          isPattern: itemData.isPattern ?? false,
          currentDepartmentStatus: itemData.currentDepartmentStatus || null,
          visibilityStatus: customSyncDto.visibilityStatus || null,
          currentStatus: 'pending',
        };
        const orderItem = this.orderItemRepository.create(orderItemData);

        // Save first to get the generated ID
        await this.orderItemRepository.save(orderItem);

        // Generate QR code for new item
        const hash = crypto.randomBytes(16).toString('hex');
        orderItem.qrCode = `ORDER_ITEM_${orderItem.id}_${hash}`;
        await this.orderItemRepository.save(orderItem);

        syncedCount++;
      }
    }

    return {
      message: 'Order items synced successfully',
      synced: syncedCount,
      updated: updatedCount,
    };
  }

  /**
   * Get all order items with optional filtering and visibility checks
   */
  async getOrderItems(
    getOrderItemsDto: GetOrderItemsDto,
  ): Promise<PaginatedResponse<OrderItem>> {
    const page = getOrderItemsDto.page || 1;
    const limit = getOrderItemsDto.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<OrderItem> = {};

    if (getOrderItemsDto.storeName) {
      where.storeName = getOrderItemsDto.storeName;
    }

    if (getOrderItemsDto.status) {
      where.currentStatus = getOrderItemsDto.status;
    }

    if (getOrderItemsDto.departmentId) {
      where.currentDepartmentId = getOrderItemsDto.departmentId;
    }

    // If visibility filtering is needed, fetch more items to account for filtering
    const fetchLimit = 
      getOrderItemsDto.roleId || getOrderItemsDto.roleName || getOrderItemsDto.roleIds || getOrderItemsDto.roleNames
        ? limit * 5 // Fetch 5x more if filtering by visibility
        : limit;

    const [allData, total] = await this.orderItemRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: 0, // Start from beginning when filtering
      take: fetchLimit,
    });

    // Filter by visibility if role filters are provided
    let filteredData = allData;
    if (
      getOrderItemsDto.roleId ||
      getOrderItemsDto.roleName ||
      getOrderItemsDto.roleIds ||
      getOrderItemsDto.roleNames
    ) {
      filteredData = allData.filter((item) =>
        this.isItemVisible(
          item,
          getOrderItemsDto.roleId,
          getOrderItemsDto.roleName,
          getOrderItemsDto.roleIds,
          getOrderItemsDto.roleNames,
        ),
      );
    }

    // Apply pagination after filtering
    const paginatedData = filteredData.slice(skip, skip + limit);
    const filteredTotal = filteredData.length;
    const lastPage = Math.ceil(filteredTotal / limit);

    return {
      message: 'Order items retrieved successfully',
      data: paginatedData,
      page,
      total: filteredTotal,
      lastPage,
    };
  }

  /**
   * Delete an order item by ID
   * This will also delete all associated tracking history due to CASCADE relationship
   */
  async deleteOrderItem(orderItemId: string): Promise<{ message: string }> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId },
    });

    if (!orderItem) {
      throw new NotFoundException(ORDER_TRACKING_MESSAGES.ORDER_ITEM_NOT_FOUND);
    }

    // Delete the order item - tracking history will be automatically deleted due to CASCADE
    await this.orderItemRepository.remove(orderItem);

    return {
      message: ORDER_TRACKING_MESSAGES.ORDER_ITEM_DELETED,
    };
  }
}

