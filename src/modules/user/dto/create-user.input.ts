import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Float, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field()
  password: string;
} 