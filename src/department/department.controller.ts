import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { GetDepartmentsDto } from './dto/get-departments.dto';
import { Department } from './entities/department.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AccessPermissions } from '../common/enums/access-permissions.enum';
import { DEPARTMENT_MESSAGES } from './messages/department.messages';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Permissions(AccessPermissions.CreateDepartment)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: DEPARTMENT_MESSAGES.CREATED,
    type: Department,
  })
  @ApiResponse({
    status: 409,
    description: DEPARTMENT_MESSAGES.ALREADY_EXISTS,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @Permissions(AccessPermissions.ReadDepartment)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all departments with pagination and search' })
  @ApiResponse({
    status: 200,
    description: DEPARTMENT_MESSAGES.LIST_FETCHED,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Department' },
        },
        page: { type: 'number' },
        total: { type: 'number' },
        lastPage: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() getDepartmentsDto: GetDepartmentsDto,
  ): Promise<PaginatedResponse<Department>> {
    return this.departmentService.findAll(getDepartmentsDto);
  }

  @Get(':id')
  @Permissions(AccessPermissions.ReadDepartment)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: DEPARTMENT_MESSAGES.FETCHED,
    type: Department,
  })
  @ApiResponse({
    status: 404,
    description: DEPARTMENT_MESSAGES.NOT_FOUND,
  })
  async findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @Permissions(AccessPermissions.UpdateDepartment)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a department' })
  @ApiParam({ name: 'id', description: 'Department ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: DEPARTMENT_MESSAGES.UPDATED,
    type: Department,
  })
  @ApiResponse({
    status: 404,
    description: DEPARTMENT_MESSAGES.NOT_FOUND,
  })
  @ApiResponse({
    status: 409,
    description: DEPARTMENT_MESSAGES.ALREADY_EXISTS,
  })
  async update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Permissions(AccessPermissions.DeleteDepartment)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a department' })
  @ApiParam({ name: 'id', description: 'Department ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: DEPARTMENT_MESSAGES.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: DEPARTMENT_MESSAGES.NOT_FOUND,
  })
  @ApiResponse({
    status: 400,
    description: DEPARTMENT_MESSAGES.HAS_USERS,
  })
  async remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }

}
