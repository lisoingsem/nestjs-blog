import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';
import { PermissionGuard } from 'shared/guards/permission.guard';
import { HasAnyRoles, Public } from 'shared/decorators/permission.decorator';
import { LoginInput, RegisterInput } from './dto';
import { LoginResponse, RegisterResponse, RefreshTokenResponse } from './entities';
import { ChangePasswordInput, ResetPasswordInput, HandleGoogleAuthInput, HandleTelegramAuthInput, LoginWithPhoneInput, HandleAppleAuthInput, RegisterWithPhoneInput, SetNewPasswordInput, ResendVerifyOtpInput, VerifyOtpInput } from './dto';
import { RoleEnum } from 'shared/contants';

@Resolver()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AuthResolver {
	constructor(private authService: AuthService) { }

	@Public()
	@Query(() => String)
	async health() {
		return 'OK';
	}

	@Public()
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

	@Public()
	@Mutation(() => RegisterResponse)
	async register(
		@Args('email') email: string,
		@Args('password') password: string,
		@Args('username') username: string,
	) {
		const user = await this.authService.register(email, password, username);
		return this.authService.login(user);
	}

	@Mutation(() => LoginResponse)
	async adminLogin(@Args('input') input: LoginInput) {
		return this.authService.adminLogin(input.email, input.password);
	}

	@Mutation(() => RefreshTokenResponse)
	async refreshToken(@Context() context: any) {
		const userId = context.req.user.id;
		const result = await this.authService.refreshToken(userId);
		return { access_token: result.access_token, user: context.req.user };
	}

	@HasAnyRoles(RoleEnum.ADMIN)
	@Mutation(() => LoginResponse)
	async adminRegister(@Args('input') input: RegisterInput) {
		const user = await this.authService.adminRegister(input.username, input.email, input.password);
		return this.authService.login(user);
	}

	@Mutation(() => String)
	async changePassword(@Args('input') input: ChangePasswordInput) {
		const result = await this.authService.changePassword(input.userId, input.oldPassword, input.newPassword);
		return result.message;
	}

	@HasAnyRoles(RoleEnum.ADMIN)
	@Mutation(() => String)
	async resetPassword(@Args('input') input: ResetPasswordInput) {
		const result = await this.authService.resetPassword(input.userId);
		return result.message + (result.newPassword ? ` New password: ${result.newPassword}` : '');
	}

	@Public()
	@Mutation(() => String)
	async handleGoogleAuth(@Args('input') input: HandleGoogleAuthInput) {
		const result = await this.authService.handleGoogleAuth(input);
		return JSON.stringify(result);
	}

	@Public()
	@Mutation(() => String)
	async handleTelegramAuth(@Args('input') input: HandleTelegramAuthInput) {
		const result = await this.authService.handleTelegramAuth(input);
		return JSON.stringify(result);
	}

	@Public()
	@Mutation(() => String)
	async loginWithPhoneNumber(@Args('input') input: LoginWithPhoneInput) {
		const result = await this.authService.loginWithPhoneNumber(input);
		return JSON.stringify(result);
	}
	
	@Public()
	@Mutation(() => String)
	async handleAppleAuth(@Args('input') input: HandleAppleAuthInput) {
		const result = await this.authService.handleAppleAuth(input);
		return JSON.stringify(result);
	}

	@Public()
	@Mutation(() => String)
	async checkForExistingUser(@Args('phoneNumber') phoneNumber: string) {
		const result = await this.authService.checkForExistingUser(phoneNumber);
		return JSON.stringify(result);
	}

	@Public()
	@Mutation(() => String)
	async registerWithPhoneNumber(@Args('input') input: RegisterWithPhoneInput) {
		const result = await this.authService.registerWithPhoneNumber(input);
		return JSON.stringify(result);
	}

	@Public()
	@Mutation(() => String)
	async verifyOTP(@Args('input') input: VerifyOtpInput) {
		const result = await this.authService.verifyOTP(input);
		return JSON.stringify(result);
	}

	@HasAnyRoles(RoleEnum.ADMIN)
	@Mutation(() => String)
	async createUserManually(@Args('phoneNumber') phoneNumber: string) {
		const result = await this.authService.createUserManually(phoneNumber);
		return JSON.stringify(result);
	}

	@Public()
	@Mutation(() => String)
	async setNewPassword(
		@Args('userId') userId: string, @Args('password') password: string
	) {
		const result = await this.authService.setNewPassword(userId, password);
		return JSON.stringify(result);
	}

	@Public()
	@Mutation(() => String)
	async resendVerifyOTP(
		@Args('verifyId') verifyId: string
	) {
		const result = await this.authService.resendVerifyOTP(verifyId);
		return JSON.stringify(result);
	}

	@HasAnyRoles(RoleEnum.ADMIN, RoleEnum.USER)
	@Mutation(() => String)
	async removeUserByUserId(
		@Args('userId') userId: string
	) {
		const result = await this.authService.removeUserByUserId(userId);
		return JSON.stringify(result);
	}
} 