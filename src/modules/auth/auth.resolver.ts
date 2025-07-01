import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { LoginResponse, RegisterResponse, RefreshTokenResponse } from './entities';
import { UnauthorizedException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Mutation(() => RegisterResponse)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
  ) {
    const user = await this.authService.register(email, password, name);
    return this.authService.login(user);
  }

  @Mutation(() => RefreshTokenResponse)
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Context() context: any) {
    const userId = context.req.user.id;
    return this.authService.refreshToken(userId);
  }
} 