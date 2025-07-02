import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { LoginInput, RegisterInput } from './dto';
import { LoginResponse, RegisterResponse, RefreshTokenResponse } from './entities';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => String)
  async health() {
    return 'OK';
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput) {
    const user = await this.authService.validateUser(input.email, input.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Mutation(() => RegisterResponse)
  async register(@Args('input') input: RegisterInput) {
    const user = await this.authService.register(input.email, input.password, input.name);
    return this.authService.login(user);
  }

  @Mutation(() => RefreshTokenResponse)
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Context() context: any) {
    const userId = context.req.user.id;
    return this.authService.refreshToken(userId);
  }
} 