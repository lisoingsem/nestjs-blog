import { InputType, Field } from '@nestjs/graphql';

export interface JwtPayload {
  email: string;
  sub: number;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  name: string;
} 