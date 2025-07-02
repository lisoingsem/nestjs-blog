import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/auth.guard';
import { UserResponse } from './entities';
import { UserService } from './user.service';

@Resolver()
export class UsersResolver {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Query(() => [UserResponse])
    async users() {
        return this.userService.findAllUsers();
    }
}
