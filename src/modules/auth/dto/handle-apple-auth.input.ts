import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class HandleAppleAuthInput {
    @Field()
    appleToken: string;
} 