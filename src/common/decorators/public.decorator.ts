import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public (skip authentication and permission checks)
 * @example
 * @Public()
 * @Get('public-endpoint')
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

