import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class InsertProfileStatisticLinkInput {
    @Field()
    profileId: string;

    @Field()
    platform: string;

    @Field()
    deviceId: string;

    @Field()
    profileLinkId: string;
} 