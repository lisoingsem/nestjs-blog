import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionService } from './permission.service';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions or roles are required, allow access
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    // Get the user from the context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req.user;

    if (!user) {
      return false;
    }

    // Check roles if required
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = await this.checkUserRoles(user.id, requiredRoles);
      if (!hasRole) {
        return false;
      }
    }

    // Check permissions if required
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = await this.checkUserPermissions(user.id, requiredPermissions);
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  private async checkUserRoles(userId: number, requiredRoles: string[]): Promise<boolean> {
    for (const role of requiredRoles) {
      const hasRole = await this.permissionService.hasRole(userId, role);
      if (hasRole) {
        return true; // User has at least one of the required roles
      }
    }
    return false;
  }

  private async checkUserPermissions(userId: number, requiredPermissions: string[]): Promise<boolean> {
    for (const permission of requiredPermissions) {
      const [resource, action] = permission.split(':');
      if (!resource || !action) {
        continue; // Skip invalid permission format
      }
      
      const hasPermission = await this.permissionService.hasPermission(userId, resource, action);
      if (!hasPermission) {
        return false; // User must have all required permissions
      }
    }
    return true;
  }
} 