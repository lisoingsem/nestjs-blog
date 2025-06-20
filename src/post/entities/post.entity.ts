import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  published: boolean;

  @Field(() => Int)
  authorId: number;

  @Field(() => User)
  author: User;

  @Field()
  createdAt: Date;
} 