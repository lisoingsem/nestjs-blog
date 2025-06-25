import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GlobalAuthGuard } from '@shared/guards';
import { CurrentUser, Public } from '@shared/decorators';

@ObjectType()
class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  user_id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  message: string;

  @Field()
  success: boolean;
}

@ObjectType()
class LogoutResponse {
  @Field()
  message: string;

  @Field()
  success: boolean;
}

@Resolver()
@UseGuards(GlobalAuthGuard)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  @Public()
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const result = await this.authService.login(email, password);
    return {
      access_token: result.access_token,
      user_id: result.user.id,
      email: result.user.email,
      name: result.user.name || null,
      message: 'Login successful',
      success: true,
    };
  }

  @Mutation(() => LogoutResponse)
  async logout(@CurrentUser() currentUser: any) {
    const result = await this.authService.logout(currentUser.id);
    return { 
      message: result.message,
      success: result.success,
    };
  }
}