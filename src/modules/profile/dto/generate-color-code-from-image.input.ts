import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GenerateColorCodeFromImageInput {
    @Field()
    profileId: string;

    @Field()
    deviceId: string;

    @Field()
    platform: string;
} 