import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class VerifyOtpInput {
    @Field()
    verifyId: string;

    @Field()
    otp: string;
} 