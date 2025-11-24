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

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: Department,
  })
  @ApiResponse({
    status: 409,
    description: 'Department with this name or code already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of departments retrieved successfully',
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
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
    type: Department,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiParam({ name: 'id', description: 'Department ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: Department,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Department with this name or code already exists',
  })
  async update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a department' })
  @ApiParam({ name: 'id', description: 'Department ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Department deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete department that has assigned users',
  })
  async remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
