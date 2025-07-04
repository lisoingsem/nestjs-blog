import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResendVerifyOtpInput {
    @Field()
    verifyId: string;
} 