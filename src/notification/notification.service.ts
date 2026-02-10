import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { NOTIFICATION_MESSAGES } from './messages/notification.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createNotificationDto: CreateNotificationDto): Promise<{ notification: Notification; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepository.create({
      title: createNotificationDto.title,
      description: createNotificationDto.description,
      roleInfo: createNotificationDto.roleInfo || null,
      user,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    return {
      notification: savedNotification,
      message: NOTIFICATION_MESSAGES.CREATED,
    };
  }

  async findAll(getNotificationsDto: GetNotificationsDto): Promise<PaginatedResponse<Notification>> {
    const { query, page = 1, limit, isRead, userId, sort = SortEnum.DESC } = getNotificationsDto;

    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user');

    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(notification.title) LIKE LOWER(:query)', { query: `%${query}%` })
            .orWhere('LOWER(notification.description) LIKE LOWER(:query)', { query: `%${query}%` });
        }),
      );
    }

    if (isRead !== undefined) {
      const isReadBool = isRead === 'true';
      qb.andWhere('notification.is_read = :isRead', { isRead: isReadBool });
    }

    if (userId) {
      qb.andWhere('user.id = :userId', { userId });
    }

    qb.orderBy('notification.createdAt', sort);

    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [notifications, total] = await qb.getManyAndCount();
    const lastPage = limit ? Math.ceil(total / limit) : 1;

    return {
      message: NOTIFICATION_MESSAGES.LIST_FETCHED,
      data: notifications,
      page,
      total,
      lastPage,
    };
  }

  async findOne(id: string): Promise<{ notification: Notification; message: string }> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NOT_FOUND);
    }

    return {
      notification,
      message: NOTIFICATION_MESSAGES.FETCHED,
    };
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<{ notification: Notification; message: string }> {
    const notification = await this.notificationRepository.findOne({ where: { id } });

    if (!notification) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NOT_FOUND);
    }

    if (updateNotificationDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateNotificationDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      notification.user = user;
      delete updateNotificationDto.userId;
    }

    Object.assign(notification, updateNotificationDto);
    const updatedNotification = await this.notificationRepository.save(notification);

    const notificationWithUser = await this.notificationRepository.findOne({
      where: { id: updatedNotification.id },
      relations: ['user'],
    });

    return {
      notification: notificationWithUser!,
      message: NOTIFICATION_MESSAGES.UPDATED,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({ where: { id } });

    if (!notification) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NOT_FOUND);
    }

    await this.notificationRepository.remove(notification);

    return {
      message: NOTIFICATION_MESSAGES.DELETED,
    };
  }
}
