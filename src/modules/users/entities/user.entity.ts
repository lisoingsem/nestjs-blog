import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserResponse {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;
}
