import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionService } from '../services/permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            'permissions',
            [context.getHandler(), context.getClass()],
        );

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            'roles',
            [context.getHandler(), context.getClass()],
        );

        // If no permissions or roles required, allow access
        if (!requiredPermissions && !requiredRoles) {
            return true;
        }

        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        // Check roles first
        if (requiredRoles && requiredRoles.length > 0) {
            console.log('🔍 Debug - User role:', user.role, 'Required roles:', requiredRoles);
            const hasRole = this.permissionService.hasRole(user, requiredRoles);
            console.log('🔍 Debug - Has role:', hasRole);
            if (!hasRole) {
                throw new ForbiddenException(`Required roles: ${requiredRoles.join(', ')}`);
            }
        }

        // Check permissions
        if (requiredPermissions && requiredPermissions.length > 0) {
            const hasPermission = this.permissionService.hasPermissions(user, requiredPermissions);
            if (!hasPermission) {
                throw new ForbiddenException(`Required permissions: ${requiredPermissions.join(', ')}`);
            }
        }

        return true;
    }


} 