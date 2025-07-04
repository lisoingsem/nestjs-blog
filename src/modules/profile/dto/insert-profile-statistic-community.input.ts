import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class InsertProfileStatisticCommunityInput {
    @Field()
    profileId: string;

    @Field()
    platform: string;

    @Field()
    deviceId: string;

    @Field()
    profileCommunityId: string;
} 