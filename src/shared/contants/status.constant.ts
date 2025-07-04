import { registerEnumType } from "@nestjs/graphql";

export enum StatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

registerEnumType(StatusEnum, {
  name: 'status',
});