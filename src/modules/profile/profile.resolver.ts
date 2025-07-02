import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class ProfileResolver {
  @Query(() => String)
  async profileHealth() {
    return 'Profile OK';
  }
}
