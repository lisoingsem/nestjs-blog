import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionService, User } from '../services/permission.service';
import { getFieldAccessRoles, FieldAccessConfig } from '../decorators';

@Injectable()
export class FieldAccessGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req?.user as User;
        const info = ctx.getInfo();

        // Get the resolver class
        const resolverClass = context.getClass();
        const fieldRoles = getFieldAccessRoles(resolverClass);

        if (!fieldRoles.length) {
            return true; // No field roles defined, allow access
        }

        // Check if the current field has role restrictions
        const currentFieldName = info.fieldName;
        const fieldRoleConfig = fieldRoles.find(fr => fr.fieldName === currentFieldName);

        if (!fieldRoleConfig) {
            return true; // No role restrictions for this field
        }

        // Check if user has required role
        if (!user) {
            throw new ForbiddenException('Authentication required for field access');
        }

        if (!fieldRoleConfig.allowedRoles.includes(user.role)) {
            throw new ForbiddenException(
                `Access denied to field '${currentFieldName}'. Required roles: ${fieldRoleConfig.allowedRoles.join(', ')}`
            );
        }

        return true;
    }
} 