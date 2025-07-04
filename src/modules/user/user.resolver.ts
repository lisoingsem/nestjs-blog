import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/auth.guard';
import { PermissionGuard } from 'shared/guards/permission.guard';
import { CurrentUser, HasAnyRoles } from 'shared/decorators/permission.decorator';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { FieldAccessInterceptor } from 'shared/interceptors/field-access.interceptor';
import { RoleEnum } from 'shared/contants';

@Resolver(() => User)
@UseGuards(JwtAuthGuard, PermissionGuard)
@UseInterceptors(FieldAccessInterceptor)
export class UsersResolver {
    constructor(private readonly userService: UserService) { }

    @Query(() => [User])
    async users() {
        return this.userService.findAllUsers();
    }

    @Query(() => User, { name: 'me' })
    @HasAnyRoles(RoleEnum.ADMIN, RoleEnum.USER)
    async getCurrentUser(@CurrentUser() user: any): Promise<User> {
        const userData = await this.userService.findOne(user.id);
        return Object.assign(new User(), userData);
    }
}