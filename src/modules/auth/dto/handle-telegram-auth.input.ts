import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class HandleTelegramAuthInput {
    @Field()
    id: string;

    @Field({ nullable: true })
    first_name?: string;

    @Field({ nullable: true })
    last_name?: string;

    @Field({ nullable: true })
    username?: string;

    @Field({ nullable: true })
    photo_url?: string;

    @Field()
    auth_date: string;

    @Field()
    hash: string;
} 