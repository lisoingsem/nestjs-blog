import { SetMetadata } from '@nestjs/common';

export const FIELD_ACCESS_KEY = 'fieldAccess';

export interface FieldAccessConfig {
    fieldName: string;
    allowedRoles: string[];
}

export const getFieldAccessRoles = (target: any): FieldAccessConfig[] => {
    return Reflect.getMetadata(FIELD_ACCESS_KEY, target) || [];
};

// Property decorator for GraphQL fields
export const FieldAccessRoles = (roles: string[]) => {
    return (target: any, propertyKey: string) => {
        const existingMetadata = Reflect.getMetadata(FIELD_ACCESS_KEY, target.constructor) || [];
        existingMetadata.push({
            fieldName: propertyKey,
            allowedRoles: roles.map(r => r.toLowerCase())
        });
        Reflect.defineMetadata(FIELD_ACCESS_KEY, existingMetadata, target.constructor);
    };
};