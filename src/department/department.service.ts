import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';
import { User } from '../user/entities/user.entity';
import { DEPARTMENT_MESSAGES } from './messages/department.messages';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<{ department: Department; message: string }> {
    const existingByName = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingByName) {
      throw new ConflictException(DEPARTMENT_MESSAGES.NAME_ALREADY_EXISTS);
    }

    const existingByCode = await this.departmentRepository.findOne({
      where: { code: createDepartmentDto.code },
    });

    if (existingByCode) {
      throw new ConflictException(DEPARTMENT_MESSAGES.CODE_ALREADY_EXISTS);
    }

    let manager: User | null = null;
    if (createDepartmentDto.managerId) {
      manager = await this.userRepository.findOne({
        where: { id: createDepartmentDto.managerId },
      });
      if (!manager) {
        throw new NotFoundException('Manager user not found');
      }
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      manager,
      status: createDepartmentDto.status || 'active',
    });

    const savedDepartment = await this.departmentRepository.save(department);
    const departmentWithManager = await this.departmentRepository.findOne({
      where: { id: savedDepartment.id },
      relations: ['manager'],
    });

    return {
      department: departmentWithManager!,
      message: DEPARTMENT_MESSAGES.CREATED,
    };
  }

  async findAll(): Promise<{ departments: Department[]; message: string }> {
    const departments = await this.departmentRepository.find({
      relations: ['users', 'manager'],
      order: { name: 'ASC' },
    });

    return {
      departments,
      message: DEPARTMENT_MESSAGES.LIST_FETCHED,
    };
  }

  async findOne(id: string): Promise<{ department: Department; message: string }> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['users', 'manager'],
    });

    if (!department) {
      throw new NotFoundException(DEPARTMENT_MESSAGES.NOT_FOUND);
    }

    return {
      department,
      message: DEPARTMENT_MESSAGES.FETCHED,
    };
  }

  async findByCode(code: string): Promise<Department | null> {
    return await this.departmentRepository.findOne({
      where: { code },
      relations: ['users', 'manager'],
    });
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<{ department: Department; message: string }> {
    const department = await this.departmentRepository.findOne({ where: { id } });

    if (!department) {
      throw new NotFoundException(DEPARTMENT_MESSAGES.NOT_FOUND);
    }

    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingByName = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existingByName) {
        throw new ConflictException(DEPARTMENT_MESSAGES.NAME_ALREADY_EXISTS);
      }
    }

    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existingByCode = await this.departmentRepository.findOne({
        where: { code: updateDepartmentDto.code },
      });

      if (existingByCode) {
        throw new ConflictException(DEPARTMENT_MESSAGES.CODE_ALREADY_EXISTS);
      }
    }

    if ((updateDepartmentDto as any).managerId !== undefined) {
      if ((updateDepartmentDto as any).managerId) {
        const manager = await this.userRepository.findOne({
          where: { id: (updateDepartmentDto as any).managerId },
        });
        if (!manager) {
          throw new NotFoundException('Manager user not found');
        }
        department.manager = manager;
      } else {
        department.manager = null;
      }
      delete (updateDepartmentDto as any).managerId;
    }

    Object.assign(department, updateDepartmentDto);
    const updatedDepartment = await this.departmentRepository.save(department);
    const departmentWithUsers = await this.departmentRepository.findOne({
      where: { id: updatedDepartment.id },
      relations: ['users', 'manager'],
    });

    return {
      department: departmentWithUsers!,
      message: DEPARTMENT_MESSAGES.UPDATED,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException(DEPARTMENT_MESSAGES.NOT_FOUND);
    }

    if (department.users && department.users.length > 0) {
      throw new BadRequestException(DEPARTMENT_MESSAGES.HAS_USERS);
    }

    await this.departmentRepository.remove(department);

    return {
      message: DEPARTMENT_MESSAGES.DELETED,
    };
  }
}
