import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionService, User } from '../services/permission.service';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/permission.decorator';

@Injectable()
export class EnhancedPermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req?.user as User;

        // Check if route is public
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Check authentication
        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        // Check role-based permissions
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (requiredRoles && !this.permissionService.hasRole(user, requiredRoles)) {
            throw new ForbiddenException(`Required roles: ${requiredRoles.join(', ')}`);
        }

        // Check permission-based access
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (requiredPermissions && !this.permissionService.hasPermissions(user, requiredPermissions)) {
            throw new ForbiddenException(`Required permissions: ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
} 