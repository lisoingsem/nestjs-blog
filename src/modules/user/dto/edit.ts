import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class EditUser {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  password?: string;
}
