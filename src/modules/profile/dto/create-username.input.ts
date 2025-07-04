import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUsernameInput {
    @Field()
    userId: string;

    @Field()
    username: string;
} 