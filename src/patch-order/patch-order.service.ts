import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PatchOrder } from './entities/patch-order.entity';
import { CreatePatchOrderDto } from './dto/create-patch-order.dto';
import { UpdatePatchOrderDto } from './dto/update-patch-order.dto';
import { GetPatchOrdersDto } from './dto/get-patch-orders.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PATCH_ORDER_MESSAGES } from './messages/patch-order.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';

@Injectable()
export class PatchOrderService {
  constructor(
    @InjectRepository(PatchOrder)
    private readonly patchOrderRepository: Repository<PatchOrder>,
  ) {}

  async create(
    createPatchOrderDto: CreatePatchOrderDto,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = this.patchOrderRepository.create(createPatchOrderDto);
    const saved = await this.patchOrderRepository.save(patchOrder);

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

    return {
      message: PATCH_ORDER_MESSAGES.LIST_FETCHED,
      data,
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

    await this.patchOrderRepository.remove(patchOrder);

    return {
      message: PATCH_ORDER_MESSAGES.DELETED,
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    patchOrder.status = updateStatusDto.status;
    const updated = await this.patchOrderRepository.save(patchOrder);

    return {
      patchOrder: updated,
      message: PATCH_ORDER_MESSAGES.STATUS_UPDATED,
    };
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<{ patchOrder: PatchOrder; message: string }> {
    const patchOrder = await this.patchOrderRepository.findOne({
      where: { id },
    });

    if (!patchOrder) {
      throw new NotFoundException(PATCH_ORDER_MESSAGES.NOT_FOUND);
    }

    patchOrder.orderStatus = updateOrderStatusDto.orderStatus;
    const updated = await this.patchOrderRepository.save(patchOrder);

    return {
      patchOrder: updated,
      message: PATCH_ORDER_MESSAGES.ORDER_STATUS_UPDATED,
    };
  }
}
