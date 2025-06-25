import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUser {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field()
  password: string;
}
