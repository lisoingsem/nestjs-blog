import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ToggleContactFavouriteInput {
    @Field()
    profileId: string;

    @Field()
    contactId: string;

    @Field()
    favourite: boolean;
}
