import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
    @Field()
    userId: string;
} 