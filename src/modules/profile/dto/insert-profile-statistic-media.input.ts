import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class InsertProfileStatisticMediaInput {
    @Field()
    profileId: string;

    @Field()
    platform: string;

    @Field()
    deviceId: string;

    @Field()
    profileMediaId: string;
} 