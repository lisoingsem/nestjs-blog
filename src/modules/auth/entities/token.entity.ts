import { Field, ObjectType } from "@nestjs/graphql";
import { UserResponse } from "@modules/user/entities";

@ObjectType()
export class RefreshTokenResponse {
    @Field()
    access_token: string;

    @Field(() => UserResponse)
    user: UserResponse;
} 