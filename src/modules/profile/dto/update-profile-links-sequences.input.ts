import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateProfileLinksSequencesInput {
    @Field()
    profileId: string;

    @Field(() => [ProfileLinkSequenceInput])
    params: ProfileLinkSequenceInput[];
}

@InputType()
export class ProfileLinkSequenceInput {
    @Field()
    id: string;

    @Field()
    sequence: number;
} 