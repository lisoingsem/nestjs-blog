import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GlobalAuthGuard } from '@shared/guards';
import { CurrentUser } from '@shared/decorators';
import { LoginResponse, LogoutResponse } from './types';

@Resolver()
@UseGuards(GlobalAuthGuard)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    try {
      const result = await this.authService.login(email, password);

      return result;
    } catch (error) { 
      throw new UnauthorizedException(error.message || 'Failed to login');
    }
  }

  @Mutation(() => LogoutResponse)
  async logout(@CurrentUser() currentUser: any) {
    try {
      const result = await this.authService.logout(currentUser.id);

      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Failed to logout');
    }
  }
}