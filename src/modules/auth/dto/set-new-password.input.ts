import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SetNewPasswordInput {
    @Field()
    userId: string;

    @Field()
    password: string;
} 