import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { GqlThrottlerGuard } from '../../shared/guards/throttler.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Resolver(() => User)
@UseGuards(GqlThrottlerGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  @UseGuards(GqlThrottlerGuard)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() currentUser: any,
  ) {
    // Users can only access their own data unless they're admin
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new Error('Unauthorized: You can only access your own data');
    }
    return this.userService.findOne(id);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() currentUser: any) {
    return this.userService.findOne(currentUser.id);
  }
}