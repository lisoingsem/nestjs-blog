import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateContactInput {
    @Field()
    profileId: string;

    @Field()
    username: string;

    @Field({ nullable: true })
    remark?: string;
} 