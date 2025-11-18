import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { USER_MESSAGES } from './messages/user.messages';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ user: User; message: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(USER_MESSAGES.ALREADY_EXISTS);
    }

    const user = this.userRepository.create({
      ...createUserDto,
      role: createUserDto.role || 'employee',
      status: createUserDto.status || 'active',
    });

    const savedUser = await this.userRepository.save(user);
    
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      message: USER_MESSAGES.CREATED,
    };
  }

  async findAll(): Promise<{ users: User[]; message: string }> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'status', 'createdAt', 'updatedAt'],
    });

    return {
      users,
      message: USER_MESSAGES.LIST_FETCHED,
    };
  }

  async findOne(id: string): Promise<{ user: User; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'postalCode', 'country', 'role', 'status', 'lastLogin', 'isEmailVerified', 'createdAt', 'updatedAt'],
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
}
