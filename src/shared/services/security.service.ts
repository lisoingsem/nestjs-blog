import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SecurityService {
  /**
   * Validate user authentication
   */
  validateAuthentication(user: any): void {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
  }

  /**
   * Check if user can access resource (owner)
   */
  canAccessResource(user: any, resourceOwnerId: number): boolean {
    if (!user) {
      return false;
    }
    return user.id === resourceOwnerId;
  }

  /**
   * Validate resource access (owner only)
   */
  validateResourceAccess(user: any, resourceOwnerId: number): void {
    this.validateAuthentication(user);
    
    if (!this.canAccessResource(user, resourceOwnerId)) {
      throw new ForbiddenException('Access denied. You can only access your own resources.');
    }
  }

  /**
   * Get user ID safely
   */
  getUserId(user: any): number {
    this.validateAuthentication(user);
    return user.id;
  }
} 