import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto';
import { CurrentUser } from '@shared/decorators';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  @Query(() => User, { name: 'me' })
  async getCurrentUser(@CurrentUser() currentUser: any) {
    const userId = currentUser.id;
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Mutation(() => User, { name: 'softDeleteUser' })
  async softDeleteUser(@Args('id', { type: () => Int }) id: number) {
    const user = await this.userService.delete(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Mutation(() => User, { name: 'restoreUser' })
  async restoreUser(@Args('id', { type: () => Int }) id: number) {
    const user = await this.userService.restore(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}