import { SetMetadata } from '@nestjs/common';

export const FIELD_PERMISSIONS_KEY = 'fieldPermissions';

export interface FieldPermission {
    resource: string;
    allowedFields: string[];
    restrictedFields?: string[];
}

export const RequireFieldPermissions = (permissions: FieldPermission[]) =>
    SetMetadata(FIELD_PERMISSIONS_KEY, permissions);

export const AllowFields = (resource: string, fields: string[]) =>
    SetMetadata(FIELD_PERMISSIONS_KEY, [{ resource, allowedFields: fields }]);

export const RestrictFields = (resource: string, fields: string[]) =>
    SetMetadata(FIELD_PERMISSIONS_KEY, [{ resource, restrictedFields: fields }]); 