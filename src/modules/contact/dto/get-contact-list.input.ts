import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class GetContactListInput {
    @Field()
    profileId: string;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    offset: number;

    @Field({ nullable: true })
    orderBy?: string;

    @Field({ nullable: true })
    searchName?: string;
} 