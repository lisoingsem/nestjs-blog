import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserResponse {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field(() => UserResponse)
  user: UserResponse;
}

@ObjectType()
export class RegisterResponse {
  @Field()
  access_token: string;

  @Field(() => UserResponse)
  user: UserResponse;
}

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  access_token: string;

  @Field(() => UserResponse)
  user: UserResponse;
} 