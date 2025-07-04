import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'shared/contants';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export const HasAnyRoles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);

export const Public = () => SetMetadata('isPublic', true);

export { CurrentUser } from './current-user.decorator';