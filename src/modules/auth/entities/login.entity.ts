import { Field, ObjectType } from "@nestjs/graphql";
import { UserResponse } from "modules/users/entities";

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field(() => UserResponse)
  user: UserResponse;
}
