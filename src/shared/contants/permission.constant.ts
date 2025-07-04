import { registerEnumType } from "@nestjs/graphql";

export enum RoleEnum {
    PUBLIC = 'public',
    USER = 'user',
    CUSTOM = 'custom',
    ADMIN = 'admin',
}

registerEnumType(RoleEnum, {
    name: 'role',
});