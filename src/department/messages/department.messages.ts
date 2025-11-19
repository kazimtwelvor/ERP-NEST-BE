export const DEPARTMENT_MESSAGES = {
  CREATED: 'Department created successfully',
  UPDATED: 'Department updated successfully',
  DELETED: 'Department deleted successfully',
  NOT_FOUND: 'Department not found',
  ALREADY_EXISTS: 'Department with this name or code already exists',
  FETCHED: 'Department fetched successfully',
  LIST_FETCHED: 'Departments fetched successfully',
  NAME_REQUIRED: 'Department name is required',
  CODE_REQUIRED: 'Department code is required',
  CODE_ALREADY_EXISTS: 'Department code already exists',
  NAME_ALREADY_EXISTS: 'Department name already exists',
  HAS_USERS: 'Cannot delete department that has assigned users',
} as const;

