import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginWithPhoneInput {
    @Field()
    phoneNumber: string;

    @Field()
    password: string;
} 