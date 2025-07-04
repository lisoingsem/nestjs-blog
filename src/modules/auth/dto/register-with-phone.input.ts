import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterWithPhoneInput {
    @Field()
    phoneNumber: string;
} 