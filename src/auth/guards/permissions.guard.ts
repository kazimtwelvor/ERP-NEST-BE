import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { AccessPermissions } from '../../common/enums/access-permissions.enum';

@Injectable()
export class PermissionsGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // First, validate JWT token (parent guard)
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }

    // Get required permissions from decorator metadata
    const requiredPermissions = this.reflector.getAllAndOverride<AccessPermissions[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access (just JWT validation)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request (set by JWT strategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    // Get user permissions from JWT payload
    const userPermissions: string[] = user.permissions || [];

    // Check if user has at least one of the required permissions
    // For create/update/delete operations, also check for manage permission
    const hasPermission = requiredPermissions.some((permission) => {
      // Convert enum to string (handles both enum values and direct strings)
      const permissionString = String(permission);
      
      // Direct permission check
      if (userPermissions.includes(permissionString)) {
        return true;
      }

      // For create/update/delete operations, check if user has manage permission
      // This covers: .create, .update, .delete operations
      if (
        permissionString.endsWith('.create') ||
        permissionString.endsWith('.update') ||
        permissionString.endsWith('.delete')
      ) {
        // Extract module name (e.g., 'user' from 'user.create', 'role-permission' from 'role-permission.create')
        const module = permissionString.split('.')[0];
        const managePermission = `${module}.manage`;
        
        // Check if user has the manage permission for this module
        if (userPermissions.includes(managePermission)) {
          return true;
        }
      }

      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

