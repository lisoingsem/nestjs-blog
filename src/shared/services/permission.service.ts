import { Injectable } from '@nestjs/common';

export interface UserClaims {
    'x-default-role': string;
    'x-allowed-roles': string[];
    'x-user-id': string;
    'x-profile-id': string;
    [key: string]: any;
}

export interface User {
    id: string;
    email: string;
    role: string;
    profileId?: string;
    userClaims?: UserClaims;
}

@Injectable()
export class PermissionService {
    /**
     * Check if user has required permissions
     */
    hasPermissions(user: User, requiredPermissions: string[]): boolean {
        if (!user || !user.role) return false;

        return requiredPermissions.some(permission =>
            user.role.includes(permission)
        );
    }

    /**
     * Check if user has required role
     */
    hasRole(user: User, requiredRoles: string[]): boolean {
        if (!user || !user.role) return false;
        const userRole = user.role.toLowerCase().replace(/[_\s]/g, '');
        return requiredRoles.some(role => userRole === role.toLowerCase().replace(/[_\s]/g, ''));
    }

    createUserWithClaims(payload: any): any {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role || 'guest',
            ...payload,
        };
    }
} 