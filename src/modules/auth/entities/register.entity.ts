import { Field, ObjectType } from "@nestjs/graphql";
import { UserResponse } from "modules/users/entities";

@ObjectType()
export class RegisterResponse {
  @Field()
  access_token: string;

  @Field(() => UserResponse)
  user: UserResponse;
}