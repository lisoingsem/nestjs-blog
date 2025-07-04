import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "./user.entity";

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  error?: string;
}