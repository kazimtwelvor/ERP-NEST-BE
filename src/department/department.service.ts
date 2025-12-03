import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { GetDepartmentsDto } from './dto/get-departments.dto';
import { AssignDepartmentStatusesDto } from './dto/assign-department-statuses.dto';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto';
import { Department } from './entities/department.entity';
import { DepartmentStatus } from './entities/department-status.entity';
import { User } from '../user/entities/user.entity';
import { DEPARTMENT_MESSAGES } from './messages/department.messages';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { SortEnum } from '../common/dto/pagination.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(DepartmentStatus)
    private readonly departmentStatusRepository: Repository<DepartmentStatus>,
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
      relations: ['manager', 'statuses'],
    });

    // Sort statuses by displayOrder if they exist
    if (departmentWithManager?.statuses) {
      departmentWithManager.statuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      department: departmentWithManager!,
      message: DEPARTMENT_MESSAGES.CREATED,
    };
  }

  async findAll(
    getDepartmentsDto: GetDepartmentsDto,
  ): Promise<PaginatedResponse<Department>> {
    const {
      query,
      page = 1,
      limit,
      status,
      managerId,
      sort = SortEnum.DESC,
    } = getDepartmentsDto;

    const qb = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.manager', 'manager')
      .leftJoinAndSelect('department.users', 'users')
      .leftJoinAndSelect('department.statuses', 'statuses')
      .addOrderBy('statuses.displayOrder', 'ASC')
      .addOrderBy('statuses.createdAt', 'ASC');

    // Search query
    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(department.name) LIKE LOWER(:query)', {
            query: `%${query}%`,
          })
            .orWhere('LOWER(department.code) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(department.description) LIKE LOWER(:query)', {
              query: `%${query}%`,
            });
        }),
      );
    }

    // Filters
    if (status) {
      qb.andWhere('department.status = :status', { status });
    }

    if (managerId) {
      qb.andWhere('manager.id = :managerId', { managerId });
    }

    // Sorting
    qb.orderBy('department.createdAt', sort);

    // Pagination - only apply if limit is provided
    if (limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [departments, total] = await qb.getManyAndCount();
    
    // Sort statuses by displayOrder for each department
    departments.forEach((department) => {
      if (department.statuses) {
        department.statuses.sort((a, b) => a.displayOrder - b.displayOrder);
      }
    });

    const lastPage = limit ? Math.ceil(total / limit) : 1;

    return {
      message: DEPARTMENT_MESSAGES.LIST_FETCHED,
      data: departments,
      page,
      total,
      lastPage,
    };
  }

  async findOne(id: string): Promise<{ department: Department; message: string }> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['users', 'manager', 'statuses'],
    });

    if (!department) {
      throw new NotFoundException(DEPARTMENT_MESSAGES.NOT_FOUND);
    }

    // Sort statuses by displayOrder if they exist
    if (department.statuses) {
      department.statuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      department,
      message: DEPARTMENT_MESSAGES.FETCHED,
    };
  }

  async findByCode(code: string): Promise<Department | null> {
    const department = await this.departmentRepository.findOne({
      where: { code },
      relations: ['users', 'manager', 'statuses'],
    });

    // Sort statuses by displayOrder if they exist
    if (department?.statuses) {
      department.statuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return department;
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
      relations: ['users', 'manager', 'statuses'],
    });

    // Sort statuses by displayOrder if they exist
    if (departmentWithUsers?.statuses) {
      departmentWithUsers.statuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

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

  // ========== Department Status Management ==========

  /**
   * Assign statuses to a department
   */
  async assignStatuses(
    departmentId: string,
    assignStatusesDto: AssignDepartmentStatusesDto,
  ): Promise<{ department: Department; message: string }> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['statuses'],
    });

    if (!department) {
      throw new NotFoundException(DEPARTMENT_MESSAGES.NOT_FOUND);
    }

    // Remove existing statuses
    if (department.statuses && department.statuses.length > 0) {
      await this.departmentStatusRepository.remove(department.statuses);
    }

    // Create new statuses
    const statuses = assignStatusesDto.statuses.map((statusDto) =>
      this.departmentStatusRepository.create({
        departmentId,
        status: statusDto.status,
        displayOrder: statusDto.displayOrder ?? 0,
        isActive: statusDto.isActive ?? true,
      }),
    );

    await this.departmentStatusRepository.save(statuses);

    // Return department with updated statuses
    const updatedDepartment = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['statuses', 'manager'],
    });

    // Sort statuses by displayOrder if they exist
    if (updatedDepartment?.statuses) {
      updatedDepartment.statuses.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return {
      department: updatedDepartment!,
      message: 'Department statuses assigned successfully',
    };
  }

  /**
   * Get all statuses for a department
   */
  async getDepartmentStatuses(departmentId: string): Promise<{
    statuses: DepartmentStatus[];
    message: string;
  }> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(DEPARTMENT_MESSAGES.NOT_FOUND);
    }

    const statuses = await this.departmentStatusRepository.find({
      where: { departmentId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });

    return {
      statuses,
      message: 'Department statuses retrieved successfully',
    };
  }

  /**
   * Update a specific department status
   */
  async updateDepartmentStatus(
    departmentId: string,
    status: string,
    updateDto: UpdateDepartmentStatusDto,
  ): Promise<{ status: DepartmentStatus; message: string }> {
    const departmentStatus = await this.departmentStatusRepository.findOne({
      where: { departmentId, status },
    });

    if (!departmentStatus) {
      throw new NotFoundException('Department status not found');
    }

    if (updateDto.displayOrder !== undefined) {
      departmentStatus.displayOrder = updateDto.displayOrder;
    }
    if (updateDto.isActive !== undefined) {
      departmentStatus.isActive = updateDto.isActive;
    }

    const updated = await this.departmentStatusRepository.save(departmentStatus);

    return {
      status: updated,
      message: 'Department status updated successfully',
    };
  }

  /**
   * Remove a status from a department
   */
  async removeDepartmentStatus(
    departmentId: string,
    status: string,
  ): Promise<{ message: string }> {
    const departmentStatus = await this.departmentStatusRepository.findOne({
      where: { departmentId, status },
    });

    if (!departmentStatus) {
      throw new NotFoundException('Department status not found');
    }

    await this.departmentStatusRepository.remove(departmentStatus);

    return {
      message: 'Department status removed successfully',
    };
  }

  /**
   * Get available statuses for a department (for validation)
   */
  async getAvailableStatusesForDepartment(departmentId: string): Promise<string[]> {
    const statuses = await this.departmentStatusRepository.find({
      where: { departmentId, isActive: true },
      order: { displayOrder: 'ASC' },
    });

    return statuses.map((s) => s.status);
  }

  /**
   * Check if a status is valid for a department
   */
  async isStatusValidForDepartment(
    departmentId: string,
    status: string,
  ): Promise<boolean> {
    const departmentStatus = await this.departmentStatusRepository.findOne({
      where: { departmentId, status, isActive: true },
    });

    return !!departmentStatus;
  }
}
