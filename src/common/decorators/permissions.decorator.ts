import { SetMetadata } from '@nestjs/common';
import { AccessPermissions } from '../enums/access-permissions.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route handler
 * @param permissions - One or more permission values from AccessPermissions enum
 * @example
 * @Permissions(AccessPermissions.ReadUser)
 * @Permissions(AccessPermissions.ReadUser, AccessPermissions.CreateUser)
 */
export const Permissions = (...permissions: AccessPermissions[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

