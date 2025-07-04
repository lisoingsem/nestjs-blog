import { ObjectType, Field, Int } from '@nestjs/graphql';
import { FieldAccessRoles } from 'shared/decorators';
import { RoleEnum, StatusEnum } from 'shared/contants';

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  username?: string | null;

  @Field(() => String, { nullable: true })
  @FieldAccessRoles([RoleEnum.USER])
  email?: string | null;

  @Field(() => String, { nullable: true })
  phone_number?: string | null;

  @Field(() => String, { nullable: true })
  social_id?: string | null;

  @Field(() => String, { nullable: true })
  social_token?: string | null;

  @Field(() => String, { nullable: true })
  login_type?: string | null;

  @Field(() => Date, { nullable: true })
  last_login?: Date | null;

  @Field(() => RoleEnum, { nullable: true })
  @FieldAccessRoles([RoleEnum.ADMIN, RoleEnum.USER])
  role?: RoleEnum | null;

  @Field(() => StatusEnum, { nullable: true })
  status?: StatusEnum | null;

  @Field(() => Date, { nullable: true })
  verified_at?: Date | null;

  @Field(() => Int, { nullable: true })
  new_password?: number | null;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Date)
  updated_at: Date;

  @Field(() => Int, { nullable: true })
  @FieldAccessRoles([RoleEnum.USER])
  count_resend_otp?: number | null;

  @Field(() => String, { nullable: true })
  created_by?: string | null;
}