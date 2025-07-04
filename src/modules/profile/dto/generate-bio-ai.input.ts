import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GenerateBioByAIInput {
    @Field()
    profileId: string;

    @Field()
    rawBio: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    length?: string;

    @Field({ nullable: true })
    platform?: string;

    @Field({ nullable: true })
    deviceId?: string;

    @Field({ nullable: true })
    regenerate?: boolean;
}
export { };
