import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class HandleGoogleAuthInput {
    @Field()
    googleToken: string;
} 