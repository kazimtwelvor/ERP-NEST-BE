import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { Notification } from './entities/notification.entity';
import { NotificationRead } from './entities/notification-read.entity';
import { User } from '../user/entities/user.entity';
import { NOTIFICATION_MESSAGES } from './messages/notification.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationRead)
    private readonly notificationReadRepository: Repository<NotificationRead>,
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
    const { query, page = 1, limit, isRead, userId, roleName, sort = SortEnum.DESC } = getNotificationsDto;

    if (!userId) {
      throw new BadRequestException('userId is required to compute read/unread status');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resolvedRoleName = roleName || user.role?.name;

    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .leftJoin(
        'notification_reads',
        'notification_read',
        'notification_read.notification_id = notification.id AND notification_read.user_id = :userId',
        { userId },
      )
      .addSelect('notification_read.read_at', 'read_at');

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
      if (isReadBool) {
        qb.andWhere('notification_read.read_at IS NOT NULL');
      } else {
        qb.andWhere('notification_read.read_at IS NULL');
      }
    }

    if (resolvedRoleName) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(notification.role_info) AS role
          WHERE LOWER(role->>'roleName') = LOWER(:roleName)
        )`,
        { roleName: resolvedRoleName },
      );
    }

    qb.orderBy('notification.createdAt', sort);

    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const { raw, entities } = await qb.getRawAndEntities();
    const total = await qb.getCount();
    const lastPage = limit ? Math.ceil(total / limit) : 1;

    return {
      message: NOTIFICATION_MESSAGES.LIST_FETCHED,
      data: entities.map((notification, index) => ({
        ...notification,
        isRead: raw[index]?.read_at != null,
      })),
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

  async markAsRead(notificationId: string, userId: string): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({ where: { id: notificationId } });
    if (!notification) {
      throw new NotFoundException(NOTIFICATION_MESSAGES.NOT_FOUND);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.notificationReadRepository.findOne({
      where: {
        notification: { id: notificationId },
        user: { id: userId },
      },
      relations: ['notification', 'user'],
    });

    if (existing) {
      existing.readAt = new Date();
      await this.notificationReadRepository.save(existing);
    } else {
      const read = this.notificationReadRepository.create({
        notification,
        user,
        readAt: new Date(),
      });
      await this.notificationReadRepository.save(read);
    }

    return {
      message: 'Notification marked as read',
    };
  }

  async markManyAsRead(userId: string, notificationIds: string[]): Promise<{ message: string; count: number }> {
    if (!notificationIds || notificationIds.length === 0) {
      throw new BadRequestException('notificationIds must not be empty');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uniqueIds = Array.from(new Set(notificationIds));
    const readAt = new Date();

    await this.notificationReadRepository
      .createQueryBuilder()
      .insert()
      .into(NotificationRead)
      .values(
        uniqueIds.map((notificationId) => ({
          notification: { id: notificationId },
          user: { id: userId },
          readAt,
        })),
      )
      .orUpdate({
        conflict_target: ['notification_id', 'user_id'],
        overwrite: ['read_at'],
      })
      .execute();

    return {
      message: 'Notifications marked as read',
      count: uniqueIds.length,
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
