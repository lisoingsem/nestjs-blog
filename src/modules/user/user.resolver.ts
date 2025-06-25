import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { CurrentUser } from '@shared/decorators';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ) {
    // Fetch the user first to check ownership
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  @Query(() => User, { name: 'me' })
  getCurrentUser(@CurrentUser() currentUser: any) {
    const userId = currentUser.id;
    return this.userService.findOne(userId);
  }

  @Mutation(() => User, { name: 'softDeleteUser' })
  softDeleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.softDelete(id);
  }

  @Mutation(() => User, { name: 'restoreUser' })
  restoreUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.restore(id);
  }
}