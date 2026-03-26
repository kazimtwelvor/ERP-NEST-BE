import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PatchOrder } from './entities/patch-order.entity';
import { PatchOrderTracking } from './entities/patch-order-tracking.entity';
import { PatchOrderNotes } from './entities/patch-order-notes.entity';
import { Role } from '../role-permission/entities/role.entity';
import { CreatePatchOrderDto } from './dto/create-patch-order.dto';
import { UpdatePatchOrderDto } from './dto/update-patch-order.dto';
import { GetPatchOrdersDto } from './dto/get-patch-orders.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PATCH_ORDER_MESSAGES } from './messages/patch-order.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PatchOrderService {
  constructor(
    @InjectRepository(PatchOrder)
    private readonly patchOrderRepository: Repository<PatchOrder>,
    @InjectRepository(PatchOrderTracking)
    private readonly patchOrderTrackingRepository: Repository<PatchOrderTracking>,
    @InjectRepository(PatchOrderNotes)
    private readonly patchOrderNotesRepository: Repository<PatchOrderNotes>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  private readonly patchStatusToRoleMap: Record<string, string[]> = {
    digitizing_in_progress: ['digitization-manager'],
    digitizing_completed: ['digitization-manager', 'sample-manager'],
    sample_in_progress: ['sample-manager'],
    sample_completed: ['sample-manager', 'production-manager'],
    production_in_progress: ['production-manager'],
    production_completed: ['production-manager', 'finishing-manager'],
    finishing_in_progress: ['finishing-manager'],
    finishing_completed: ['finishing-manager', 'shipping-manager'],
    ready_to_ship: ['shipping-manager'],
    shipped: ['shipping-manager'],
  };

  private resolvePatchRoleForStatus(status: string): string[] {
    const normalized = (status || '').toLowerCase();
    const roles = this.patchStatusToRoleMap[normalized];
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
  }

  private async createPatchStatusNotification(
    patchOrder: PatchOrder,
    status: string,
    actorUserId: string | null,
    actorDisplayName?: string,
  ): Promise<void> {
    if (!actorUserId) return;

    const mappedRoleNames = this.resolvePatchRoleForStatus(status);
    const roleNames = ['admin', ...mappedRoleNames];

    const roles = await this.roleRepository.find({
      where: { name: In(roleNames) },
    });
    const roleByName = new Map(roles.map((role) => [role.name, role]));

    const roleInfo = roleNames.map((name) => ({
      roleId: roleByName.get(name)?.id || '',
      roleName: name,
    }));

    const orderLabel = patchOrder.orderNo || patchOrder.orderId || patchOrder.id;
    const updatedBy = actorDisplayName?.trim() || 'Unknown User';
    await this.notificationService.create({
      title: `Order status updated`,
      description: `Order ${orderLabel} status updated to ${status} by ${updatedBy}`,
      userId: actorUserId,
      roleInfo,
    });
  }

  private generateQRCodeUrl(patchOrderId: string): string {
    const frontendUrl =
      this.configService.get<string>('frontendUrl') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    const baseUrl = frontendUrl.replace(/\/$/, '');
    return `${baseUrl}/orders/update-status/patches?orderItemId=${patchOrderId}`;
  }

  async create(
    createPatchOrderDto: CreatePatchOrderDto,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const lastOrders = await this.patchOrderRepository.find({
      order: { createdAt: 'DESC' },
      select: ['orderNo'],
      take: 1,
    });

    let orderNumber = 1;
    if (lastOrders.length > 0 && lastOrders[0].orderNo) {
      const lastNumber = parseInt(lastOrders[0].orderNo.replace('ORD_', ''));
      orderNumber = lastNumber + 1;
    }
    const orderNo = `ORD_${orderNumber.toString().padStart(5, '0')}`;

    const patchOrder = this.patchOrderRepository.create({
      ...createPatchOrderDto,
      orderNo,
    });
    const saved = await this.patchOrderRepository.save(patchOrder);

    // Generate QR code when status is production and QR code not already generated
    if (saved.status === 'production' && !saved.qrCode) {
      const hash = crypto.randomBytes(16).toString('hex');
      saved.qrCode = `PATCH_ORDER_${saved.id}_${hash}`;
      saved.qrCodeUrl = this.generateQRCodeUrl(saved.id);
      await this.patchOrderRepository.save(saved);
    }

    return {
      patchOrder: saved,
      message: PATCH_ORDER_MESSAGES.CREATED,
    };
  }

  async findAll(
    getPatchOrdersDto: GetPatchOrdersDto,
  ): Promise<PaginatedResponse<PatchOrder>> {
    const {
      query,
      page = 1,
      limit,
      formType,
      sort = SortEnum.DESC,
    } = getPatchOrdersDto;

    const qb = this.patchOrderRepository.createQueryBuilder('patch');

    if (query) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('LOWER(patch.customerName) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(patch.customerEmail) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(patch.customerPhone) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(patch.shape) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(patch.color) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(patch.backingType) LIKE LOWER(:query)', {
              query: `%${query}%`,
            });
        }),
      );
    }

    if (formType) {
      qb.andWhere('patch.formType = :formType', { formType });
    }

    qb.orderBy('patch.createdAt', sort);

    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [data, total] = await qb.getManyAndCount();
    const lastPage = limit ? Math.ceil(total / limit) : 1;

    // Enrich patch orders with per-stage last update times from tracking history
    const ids = data.map((patch) => patch.id);
    let dataWithStageTimes: any[] = data;

    if (ids.length > 0) {
      const trackingRecords = await this.patchOrderTrackingRepository.find({
        where: { patchOrderId: In(ids) },
        order: { createdAt: 'DESC' },
      });

      const stageTimeByOrder: Record<
        string,
        { digitizing?: Date; sample?: Date; production?: Date; finishing?: Date; shipping?: Date }
      > = {};
      const statusTimeByOrder: Record<string, Record<string, Date>> = {};

      // Both in_progress and completed statuses count for each stage – use the most recent of either
      const STAGE_STATUSES: Record<string, string[]> = {
        digitizing: ['digitizing_in_progress', 'digitizing_completed'],
        sample: ['sample_in_progress', 'sample_completed'],
        production: ['production_in_progress', 'production_completed'],
        finishing: ['finishing_in_progress', 'finishing_completed'],
        shipping: ['ready_to_ship', 'shipped'],
      };

      for (const record of trackingRecords) {
        const status = (record.status || '').toLowerCase();
        let stage: 'digitizing' | 'sample' | 'production' | 'finishing' | 'shipping' | null = null;
        for (const [st, statuses] of Object.entries(STAGE_STATUSES)) {
          if (statuses.includes(status)) {
            stage = st as 'digitizing' | 'sample' | 'production' | 'finishing' | 'shipping';
            break;
          }
        }
        if (!stage) continue;

        const bucket =
          stageTimeByOrder[record.patchOrderId] ||
          (stageTimeByOrder[record.patchOrderId] = {});
        const statusBucket =
          statusTimeByOrder[record.patchOrderId] ||
          (statusTimeByOrder[record.patchOrderId] = {});

        // Records ordered DESC by createdAt – first seen per stage is the latest update
        if (!bucket[stage]) {
          bucket[stage] = record.createdAt;
        }
        if (!statusBucket[status]) {
          statusBucket[status] = record.createdAt;
        }
      }

      dataWithStageTimes = data.map((patch) => {
        const stages = stageTimeByOrder[patch.id];
        if (!stages) return patch;

        return {
          ...patch,
          lastStageTimes: {
            digitizing: stages.digitizing?.toISOString(),
            sample: stages.sample?.toISOString(),
            production: stages.production?.toISOString(),
            finishing: stages.finishing?.toISOString(),
            shipping: stages.shipping?.toISOString(),
          },
          lastStatusTimes: Object.fromEntries(
            Object.entries(statusTimeByOrder[patch.id] || {}).map(([status, date]) => [
              status,
              date.toISOString(),
            ]),
          ),
        };
      });
    }

    return {
      message: PATCH_ORDER_MESSAGES.LIST_FETCHED,
      data: dataWithStageTimes as PatchOrder[],
      page,
      total,
      lastPage,
    };
  }

  async findOne(
    id: string,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    return {
      patchOrder,
      message: PATCH_ORDER_MESSAGES.FETCHED,
    };
  }

  async findByOrderId(
    orderId: string,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { orderId },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    return {
      patchOrder,
      message: PATCH_ORDER_MESSAGES.FETCHED,
    };
  }

  async update(
    id: string,
    updatePatchOrderDto: UpdatePatchOrderDto,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    Object.assign(patchOrder, updatePatchOrderDto);
    const updated = await this.patchOrderRepository.save(patchOrder);

    return {
      patchOrder: updated,
      message: PATCH_ORDER_MESSAGES.UPDATED,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    // Delete related tracking records first
    await this.patchOrderTrackingRepository.delete({ patchOrderId: id });

    // Delete related notes
    await this.patchOrderNotesRepository.delete({ patchOrderId: id });

    // Now delete the patch order
    await this.patchOrderRepository.remove(patchOrder);

    return {
      message: PATCH_ORDER_MESSAGES.DELETED,
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    actorUserId?: string,
    actorDisplayName?: string,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    patchOrder.status = updateStatusDto.status;

    // Generate QR code when status changes to production
    if (updateStatusDto.status === 'production' && !patchOrder.qrCode) {
      const hash = crypto.randomBytes(16).toString('hex');
      patchOrder.qrCode = `PATCH_ORDER_${patchOrder.id}_${hash}`;
      patchOrder.qrCodeUrl = this.generateQRCodeUrl(patchOrder.id);
    }

    const updated = await this.patchOrderRepository.save(patchOrder);

    await this.createPatchStatusNotification(
      updated,
      updateStatusDto.status,
      actorUserId || null,
      actorDisplayName,
    );

    return {
      patchOrder: updated,
      message: PATCH_ORDER_MESSAGES.STATUS_UPDATED,
    };
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    actorUserId?: string,
    actorDisplayName?: string,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    patchOrder.orderStatus = updateOrderStatusDto.orderStatus;
    const updated = await this.patchOrderRepository.save(patchOrder);

    await this.createPatchStatusNotification(
      updated,
      updateOrderStatusDto.orderStatus,
      actorUserId || null,
      actorDisplayName,
    );

    return {
      patchOrder: updated,
      message: PATCH_ORDER_MESSAGES.ORDER_STATUS_UPDATED,
    };
  }

  async getTrackingHistory(patchOrderId: string) {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id: patchOrderId },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    const tracking = await this.patchOrderTrackingRepository.find({
      where: { patchOrderId },
      relations: ['department', 'user'],
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Tracking history fetched successfully',
      data: tracking,
      patchOrder,
    };
  }

  /**
   * Get abandoned patch orders
   * A patch order is considered abandoned if:
   * 1. It has not been updated for the specified threshold (default: 48 hours)
   * 2. Its current status is NOT 'completed' or 'cancelled'
   */
  async getAbandonedPatchOrders(
    page: number = 1,
    limit: number = 10,
    formType?: string,
    thresholdHours: number = 48,
    sortBy: string = 'updated_at',
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedResponse<PatchOrder>> {
    // Calculate the cutoff time (48 hours ago or custom threshold)
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - thresholdHours * 60 * 60 * 1000);

    // Build the query
    let query = this.patchOrderRepository
      .createQueryBuilder('patchOrder')
      .where('patchOrder.updated_at <= :cutoffTime', { cutoffTime })
      .andWhere('patchOrder.status NOT IN (:...completedStatuses)', {
        completedStatuses: ['completed', 'cancelled'],
      });

    // Apply form type filter if provided
    if (formType) {
      query = query.andWhere('patchOrder.form_type = :formType', { formType });
    }

    // Get total count for pagination
    const total = await query.getCount();
    const lastPage = Math.ceil(total / limit);

    // Apply sorting and pagination
    const validSortFields = ['updated_at', 'created_at', 'orderNo', 'customerName'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'updated_at';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const data = await query
      .orderBy(`patchOrder.${sortField}`, orderDirection)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      message: PATCH_ORDER_MESSAGES.ABANDONED_FETCHED,
      data,
      page,
      total,
      lastPage,
    };
  }

  async uploadDocument(
    id: string,
    file: any,
    documentType: 'dig_document' | 'sim_document',
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    const fileData = file.buffer.toString('base64');
    
    if (documentType === 'dig_document') {
      patchOrder.digDocument = fileData;
    } else if (documentType === 'sim_document') {
      patchOrder.simDocument = fileData;
    }

    const updated = await this.patchOrderRepository.save(patchOrder);

    return {
      patchOrder: updated,
      message: 'Document uploaded successfully',
    };
  }

  async uploadImage(
    id: string,
    file: any,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    const fileData = file.buffer.toString('base64');
    patchOrder.image = fileData;

    const updated = await this.patchOrderRepository.save(patchOrder);

    return {
      patchOrder: updated,
      message: 'Image uploaded successfully',
    };
  }

  async deleteImage(
    id: string,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    patchOrder.image = null;
    const updated = await this.patchOrderRepository.save(patchOrder);

    return {
      patchOrder: updated,
      message: 'Image deleted successfully',
    };
  }

  async getDocuments(id: string): Promise<{ documents: { digDocument?: string; simDocument?: string }; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
      select: ['id', 'digDocument', 'simDocument'],
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    return {
      documents: {
        digDocument: patchOrder.digDocument ?? undefined,
        simDocument: patchOrder.simDocument ?? undefined,
      },
      message: 'Documents fetched successfully',
    };
  }

  async updateDocuments(
    id: string,
    documents: { digDocument?: string; simDocument?: string },
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    if (documents.digDocument !== undefined) {
      patchOrder.digDocument = documents.digDocument;
    }
    if (documents.simDocument !== undefined) {
      patchOrder.simDocument = documents.simDocument;
    }

    const updated = await this.patchOrderRepository.save(patchOrder);

    return {
      patchOrder: updated,
      message: 'Documents updated successfully',
    };
  }

  async addNote(
    patchOrderId: string,
    userId: string,
    note: string,
    imageUrl?: string,
  ): Promise<{ note: PatchOrderNotes; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id: patchOrderId },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    const noteEntity = this.patchOrderNotesRepository.create({
      patchOrderId,
      userId,
      note,
      imageUrl: imageUrl || null,
      orderStatus: patchOrder.orderStatus,
    });

    const saved = await this.patchOrderNotesRepository.save(noteEntity);

    return {
      note: saved,
      message: 'Note added successfully',
    };
  }

  async getNotes(patchOrderId: string): Promise<{ notes: PatchOrderNotes[]; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id: patchOrderId },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    const notes = await this.patchOrderNotesRepository.find({
      where: { patchOrderId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      notes,
      message: 'Notes fetched successfully',
    };
  }
}
