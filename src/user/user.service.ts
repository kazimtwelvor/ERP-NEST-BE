import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { User } from './entities/user.entity';
import { Role } from '../role-permission/entities/role.entity';
import { Department } from '../department/entities/department.entity';
import { USER_MESSAGES } from './messages/user.messages';
import { EmailService } from '../email/email.service';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';
import { randomInt } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ user: User; message: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(USER_MESSAGES.ALREADY_EXISTS);
    }

    let role: Role | null;
    if (createUserDto.roleId) {
      role = await this.roleRepository.findOne({ where: { id: createUserDto.roleId } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    } else {
      role = await this.roleRepository.findOne({ where: { name: 'employee' } });
      if (!role) {
        throw new NotFoundException('Default employee role not found. Please run seeds first.');
      }
    }

    let department: Department | null = null;
    if (createUserDto.departmentId) {
      department = await this.departmentRepository.findOne({
        where: { id: createUserDto.departmentId },
      });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    const verificationCode = this.generateVerificationCode();

    const { roleId, departmentId, ...userData } = createUserDto;

    const user = this.userRepository.create({
      ...userData,
      role,
      department,
      status: createUserDto.status || 'active',
      verificationCode,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);
    
    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        savedUser.email,
        verificationCode,
        savedUser.firstName,
      );
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message || error);
      console.log(`📧 Verification code for ${savedUser.email}: ${verificationCode}`);
      // Continue even if email fails - code is still saved
    }
    
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      message: USER_MESSAGES.CREATED,
    };
  }

  async findAll(getUsersDto: GetUsersDto): Promise<PaginatedResponse<User>> {
    const {
      query,
      page = 1,
      limit = 10,
      roleId,
      departmentId,
      status,
      isEmailVerified,
      sort = SortEnum.DESC,
    } = getUsersDto;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.department', 'department')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.status',
        'user.isEmailVerified',
        'user.createdAt',
        'user.updatedAt',
        'role.id',
        'role.name',
        'role.displayName',
        'department.id',
        'department.name',
        'department.code',
      ]);

    // Search query
    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.firstName) LIKE LOWER(:query)', {
            query: `%${query}%`,
          })
            .orWhere('LOWER(user.lastName) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(user.email) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(user.phone) LIKE LOWER(:query)', {
              query: `%${query}%`,
            });
        }),
      );
    }

    // Filters
    if (roleId) {
      qb.andWhere('role.id = :roleId', { roleId });
    }

    if (departmentId) {
      qb.andWhere('department.id = :departmentId', { departmentId });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (isEmailVerified !== undefined) {
      qb.andWhere('user.is_email_verified = :isEmailVerified', {
        isEmailVerified: isEmailVerified === 'true',
      });
    }

    // Sorting
    qb.orderBy('user.createdAt', sort);

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    const [users, total] = await qb.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return {
      message: USER_MESSAGES.LIST_FETCHED,
      data: users,
      page,
      total,
      lastPage,
    };
  }

  async findOne(id: string): Promise<{ user: User; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions', 'department'],
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'postalCode', 'status', 'lastLogin', 'isEmailVerified', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    return {
      user,
      message: USER_MESSAGES.FETCHED,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions', 'department'],
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ user: User; message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException(USER_MESSAGES.ALREADY_EXISTS);
      }
    }

    if ((updateUserDto as any).roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: (updateUserDto as any).roleId },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      user.role = role;
      delete (updateUserDto as any).roleId;
    }

    if ((updateUserDto as any).departmentId !== undefined) {
      if ((updateUserDto as any).departmentId) {
        const department = await this.departmentRepository.findOne({
          where: { id: (updateUserDto as any).departmentId },
        });
        if (!department) {
          throw new NotFoundException('Department not found');
        }
        user.department = department;
      } else {
        user.department = null;
      }
      delete (updateUserDto as any).departmentId;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = updatedUser;

    return {
      user: userWithoutPassword as User,
      message: USER_MESSAGES.UPDATED,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    await this.userRepository.remove(user);

    return {
      message: USER_MESSAGES.DELETED,
    };
  }

  /**
   * Generate a random 6-digit verification code
   */
  private generateVerificationCode(): string {
    return randomInt(100000, 999999).toString();
  }

  /**
   * Verify user email with verification code
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: verifyEmailDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (user.verificationCode !== verifyEmailDto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    user.isEmailVerified = true;
    user.verificationCode = '';
    await this.userRepository.save(user);

    return {
      message: 'Email verified successfully',
    };
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(resendDto: ResendVerificationDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: resendDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationCode = this.generateVerificationCode();
    user.verificationCode = verificationCode;
    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
        user.firstName,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email. Please try again later.');
    }

    return {
      message: 'Verification code sent successfully. Please check your email.',
    };
  }
}
