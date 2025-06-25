import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  user_id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  message: string;

  @Field()
  success: boolean;
}

@ObjectType()
export class LogoutResponse {
  @Field()
  message: string;

  @Field()
  success: boolean;
} 