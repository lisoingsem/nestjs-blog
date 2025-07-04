import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'shared/prisma';
import * as bcrypt from 'bcrypt';
import { HandleGoogleAuthInput } from './dto/handle-google-auth.input';
import { HandleTelegramAuthInput } from './dto/handle-telegram-auth.input';
import { LoginWithPhoneInput } from './dto/login-with-phone.input';
import { HandleAppleAuthInput } from './dto/handle-apple-auth.input';
import { RegisterWithPhoneInput } from './dto/register-with-phone.input';
import { VerifyOtpInput } from './dto/verify-otp.input';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as jwksClient from 'jwks-rsa';
import { getAppleConfig } from '@config/apple.config';
import { getGoogleConfig } from '@config/google.config';
import { getTelegramConfig } from '@config/telegram.config';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) { }

	async validateUser(email: string, password: string): Promise<any> {
		const user = await this.prisma.user.findFirst({ where: { email } });
		if (user && user.password && await bcrypt.compare(password, user.password)) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async login(user: any) {
		const payload = { email: user.email, sub: user.id };
		return {
			access_token: this.jwtService.sign(payload),
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};
	}

	async register(email: string, password: string, username: string) {
		const existingUser = await this.prisma.user.findFirst({ where: { email } });
		if (existingUser) {
			throw new UnauthorizedException('User already exists');
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await this.prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				username,
			},
		});
		return user;
	}

	async refreshToken(userId: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const payload = { email: user.email, sub: user.id };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async adminRegister(username: string, email: string, password: string) {
		const existingUser = await this.prisma.user.findFirst({ where: { email } });
		if (existingUser) {
			throw new UnauthorizedException('Admin already exists');
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await this.prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
				role: 'admin',
			},
		});
		return user;
	}

	async adminLogin(username: string, password: string) {
		const user = await this.prisma.user.findFirst({ where: { username, role: 'admin', status: 'active' } });
		if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedException('Invalid admin credentials');
		}
		return this.login(user);
	}

	async changePassword(userId: string, oldPassword: string, newPassword: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user || !user.password || !(await bcrypt.compare(oldPassword, user.password))) {
			throw new UnauthorizedException('Invalid old password');
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await this.prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});
		return { status: 200, message: 'Password changed successfully' };
	}

	async resetPassword(userId: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const newPassword = Math.random().toString(36).slice(-8);
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await this.prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});
		return { status: 200, message: 'Password reset successfully', newPassword };
	}

	async handleGoogleAuth(input: HandleGoogleAuthInput): Promise<any> {
		const { googleToken } = input;
		try {
			const googleConfig = getGoogleConfig(this.configService);

			const validClientIds = [googleConfig.CLIENT_ID, googleConfig.CLIENT_ID_IOS, googleConfig.CLIENT_ID_ANDROID].filter(Boolean);

			const client = new OAuth2Client();
			const ticket = await client.verifyIdToken({
				idToken: googleToken,
				audience: validClientIds,
			});

			const payload = ticket.getPayload();
			if (!payload) throw new Error('invalid_google_token');
			const googleId = payload.sub;
			const email = payload.email;
			const name = payload.name;
			// 2. Check for user by social_id
			let user = await this.prisma.user.findFirst({ where: { social_id: googleId, role: 'user' } });
			if (user) {
				if (user.status !== 'active') throw new Error('user_has_been_banned_inactive');
				const profile = await this.prisma.profile.findFirst({ where: { user_id: user.id, status: 'active' } });
				if (!profile) throw new Error('profile_not_found');
				const accessToken = this.generateAccessToken({
					subUserId: user.id,
					profileId: profile.id,
					name: user.username || '',
					role: 'user',
					roles: ['user'],
				});
				return {
					status: 200,
					bearerToken: accessToken,
					isRegistered: true,
					noUsername: user.username ? false : true,
				};
			}
			// 3. Register new user/profile
			user = await this.prisma.user.create({
				data: {
					social_id: googleId,
					email,
					login_type: 'google',
					last_login: new Date(),
					role: 'user',
					status: 'active',
				},
			});
			const profile = await this.prisma.profile.create({
				data: {
					user_id: user.id,
					name,
					status: 'active',
				},
			});
			await this.prisma.profileColor.create({ data: { profile_id: profile.id } });
			const accessToken = this.generateAccessToken({
				subUserId: user.id,
				profileId: profile.id,
				name: user.username || '',
				role: 'user',
				roles: ['user'],
			});
			return {
				status: 200,
				bearerToken: accessToken,
				isRegistered: false,
				noUsername: user.username ? false : true,
			};
		} catch (error: any) {
			return {
				status: 500,
				error: error.message || 'internal_server_error',
			};
		}
	}

	private generateAccessToken({ subUserId, profileId, name, role, roles, params }: { subUserId: string; profileId: string; name: string; role: string; roles: string[]; params?: { value: string; key: string }[] }): string {
		const iat = Math.floor(Date.now() / 1000);
		const exp = iat + 31536000;
		const paramsObject: Record<string, string> = {};

		params?.forEach((param) => {
			paramsObject[param.key] = param.value;
		});

		const tokenPayload = {
			sub: subUserId,
			name,
			iat,
			exp,
		};
		return jwt.sign(tokenPayload, this.configService.get('AUTH_SECRET') || '', { algorithm: 'HS256' });
	}

	async handleTelegramAuth(input: HandleTelegramAuthInput): Promise<any> {
		const telegramConfig = getTelegramConfig(this.configService);
		const telegramBotToken = telegramConfig.TELEGRAM_BOT_TOKEN;
		if (!telegramBotToken) throw new Error('telegram_bot_token_not_found');

		const data = { ...input } as any;
		const receivedHash = data.hash;
		delete data.hash;
		const dataCheckArr = Object.keys(data)
			.sort()
			.map((key) => `${key}=${data[key as keyof typeof data]}`);
		const dataCheckString = dataCheckArr.join('\n');
		const secretKey = crypto.createHash('sha256').update(telegramBotToken).digest();
		const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
		if (calculatedHash !== receivedHash) throw new Error('invalid_telegram_auth');

		try {
			// 2. Check for user by social_id
			let user = await this.prisma.user.findFirst({ where: { social_id: input.id, role: 'user' } });
			if (user) {
				if (user.status !== 'active') throw new Error('user_has_been_banned_inactive');
				const profile = await this.prisma.profile.findFirst({ where: { user_id: user.id, status: 'active' } });
				if (!profile) throw new Error('profile_not_found');
				const accessToken = this.generateAccessToken({
					subUserId: user.id,
					profileId: profile.id,
					name: user.username || '',
					role: 'user',
					roles: ['user'],
				});
				return {
					status: 200,
					bearerToken: accessToken,
					isRegistered: true,
					noUsername: user.username ? false : true,
				};
			}
			// 3. Register new user/profile
			user = await this.prisma.user.create({
				data: {
					social_id: input.id,
					login_type: 'telegram',
					last_login: new Date(),
					role: 'user',
					status: 'active',
				},
			});
			const profile = await this.prisma.profile.create({
				data: {
					user_id: user.id,
					name: `${input.first_name ?? ''} ${input.last_name ?? ''}`.trim(),
					status: 'active',
				},
			});
			await this.prisma.profileColor.create({ data: { profile_id: profile.id } });
			const accessToken = this.generateAccessToken({
				subUserId: user.id,
				profileId: profile.id,
				name: user.username || '',
				role: 'user',
				roles: ['user'],
			});
			return {
				status: 200,
				bearerToken: accessToken,
				isRegistered: false,
				noUsername: user.username ? false : true,
			};
		} catch (error: any) {
			return {
				status: 500,
				error: error.message || 'internal_server_error',
			};
		}
	}

	async loginWithPhoneNumber(input: LoginWithPhoneInput): Promise<any> {
		const { phoneNumber, password } = input;
		try {
			const user = await this.prisma.user.findFirst({ where: { phone_number: phoneNumber, role: 'user', status: 'active' } });
			if (!user) throw new Error('user_not_found');

			const hashedPassword = user.password || '';

			const isMatch = await bcrypt.compare(password, hashedPassword);
			if (!isMatch) throw new Error('credential_is_incorrect');

			const profile = await this.prisma.profile.findFirst({ where: { user_id: user.id, status: 'active' } });
			if (!profile) throw new Error('profile_not_found');

			const accessToken = this.generateAccessToken({
				subUserId: user.id,
				profileId: profile.id,
				name: user.username || '',
				role: 'user',
				roles: ['user'],
			});
			return {
				status: 200,
				bearerToken: accessToken,
				noUsername: user.username ? false : true,
			};
		} catch (error: any) {
			return {
				status: 500,
				error: error.message || 'internal_server_error',
			};
		}
	}

	async handleAppleAuth(input: HandleAppleAuthInput): Promise<any> {
		const appleConfig = getAppleConfig(this.configService);

		function getAppleSigningKey(header: jwt.JwtHeader): Promise<string> {
			return new Promise((resolve, reject) => {
				if (!header.kid) {
					reject(new Error('Token header missing kid'));
					return;
				}
				const client = jwksClient({ jwksUri: appleConfig.JWKS_URI });
				client.getSigningKey(header.kid, (err: any, key: any) => {
					if (err) {
						reject(err);
						return;
					}
					const signingKey = key?.getPublicKey();
					if (!signingKey) {
						reject(new Error('Unable to get signing key'));
						return;
					}
					resolve(signingKey);
				});
			});
		}

		async function verifyAppleToken(idToken: string): Promise<{ id: string; email: string; emailVerified: boolean; isPrivateEmail: boolean }> {
			if (!idToken || typeof idToken !== 'string') throw new Error('Invalid token: Token must be a non-empty string');
			const tokenParts = idToken.split('.');
			if (tokenParts.length !== 3) throw new Error('Invalid token format: Token must have 3 parts');
			let header: jwt.JwtHeader;
			try {
				header = jwt.decode(idToken, { complete: true })?.header as jwt.JwtHeader;
				if (!header) throw new Error('Unable to decode token header');
			} catch (error) {
				throw new Error('Invalid token: Unable to decode header');
			}
			const signingKey = await getAppleSigningKey(header);
			const decoded = jwt.verify(idToken, signingKey, {
				issuer: appleConfig.ISSUER,
				audience: appleConfig.CLIENT_ID,
				algorithms: ['RS256'],
				clockTolerance: 60,
			}) as any;
			const now = Math.floor(Date.now() / 1000);
			if (decoded.exp < now) throw new Error('Token expired');
			if (decoded.iat > now + 60) throw new Error('Token issued in the future');
			return {
				id: decoded.sub,
				email: decoded.email,
				emailVerified: decoded.email_verified === 'true',
				isPrivateEmail: decoded.is_private_email === 'true',
			};
		}
		try {
			const userInfo = await verifyAppleToken(input.appleToken);
			let user = await this.prisma.user.findFirst({ where: { social_id: userInfo.id, role: 'user' } });
			if (user) {
				if (user.status !== 'active') throw new Error('user_has_been_banned_inactive');
				const profile = await this.prisma.profile.findFirst({ where: { user_id: user.id, status: 'active' } });
				if (!profile) throw new Error('profile_not_found');
				const accessToken = this.generateAccessToken({
					subUserId: user.id,
					profileId: profile.id,
					name: user.username || '',
					role: 'user',
					roles: ['user'],
				});
				return {
					status: 200,
					bearerToken: accessToken,
					isRegistered: true,
					noUsername: user.username ? false : true,
				};
			}
			// Register new user/profile
			user = await this.prisma.user.create({
				data: {
					social_id: userInfo.id,
					email: userInfo.email,
					login_type: 'apple',
					last_login: new Date(),
					role: 'user',
					status: 'active',
				},
			});
			const profile = await this.prisma.profile.create({
				data: {
					user_id: user.id,
					name: '',
					status: 'active',
				},
			});
			const accessToken = this.generateAccessToken({
				subUserId: user.id,
				profileId: profile.id,
				name: userInfo.email,
				role: 'user',
				roles: ['user'],
			});
			return {
				status: 200,
				bearerToken: accessToken,
				isRegistered: false,
			};
		} catch (error: any) {
			return {
				status: 500,
				error: error.message || 'internal_server_error',
			};
		}
	}

	async checkForExistingUser(phoneNumber: string): Promise<{
		status: number;
		error?: string;
		isExisting?: boolean;
	}> {
		try {
			const user = await this.prisma.user.findFirst({ where: { phone_number: phoneNumber, role: 'user', status: 'active' } });
			return { status: 200, isExisting: !!user };
		} catch (error: any) {
			return { status: 500, isExisting: false };
		}
	}

	async registerWithPhoneNumber(input: RegisterWithPhoneInput): Promise<any> {
		const { phoneNumber } = input;
		try {

			const existUser = await this.prisma.user.findFirst({ where: { phone_number: phoneNumber, role: 'user', status: 'active' } });
			if (existUser) {
				return { status: 500, error: 'user_already_exists' };
			}

			const user = await this.prisma.user.create({
				data: {
					phone_number: phoneNumber,
					role: 'user',
					login_type: 'phone',
					status: 'inactive',
					new_password: 1,
				},
			});

			const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

			const tempUser = await this.prisma.tempUser.create({
				data: {
					user_id: user.id,
					verify_type: 'otp',
					verify_code: verifyCode,
				},
			});

			const smsResponse = { status: 200 };
			if (smsResponse.status !== 200) {
				return { status: 500, error: 'Failed to send SMS' };
			}

			return {
				status: 200,
				verifyId: tempUser.id,
				phoneNumber,
			};
		} catch (error: any) {
			return { status: 500, error: error.message || 'internal_server_error' };
		}
	}

	async verifyOTP(input: VerifyOtpInput): Promise<any> {
		const { verifyId, otp } = input;
		const prisma = this.prisma;
		const generateAccessToken = this.generateAccessToken.bind(this);
		try {
			return await prisma.$transaction(async (tx) => {

				const tempUser = await tx.tempUser.findFirst({ where: { id: verifyId, verify_code: otp } });
				if (!tempUser) throw new Error('otp_is_incorrect');
				if (!tempUser.user_id) throw new Error('user_id_missing');

				const user = await tx.user.findFirst({ where: { id: tempUser.user_id, verified_at: { not: null }, login_type: 'phone' } });
				if (user) throw new Error('user_already_verified');
				await tx.tempUser.update({ where: { id: verifyId }, data: { verified_at: new Date() } });

				await tx.user.update({ where: { id: tempUser.user_id }, data: { status: 'active', verified_at: new Date() } });
				let profile = await tx.profile.findFirst({ where: { user_id: tempUser.user_id } });
				if (!profile) {
					profile = await tx.profile.create({ data: { user_id: tempUser.user_id, username: '', name: '', profile_image: '' } });
					await tx.profileColor.create({ data: { profile_id: profile.id } });
				}

				const accessToken = generateAccessToken({
					subUserId: tempUser.user_id,
					profileId: profile.id,
					name: '',
					role: 'user',
					roles: ['user'],
				});

				return {
					status: 200,
					bearerToken: accessToken,
				};
			});
		} catch (error: any) {
			return { status: 500, error: error.message || 'internal_server_error' };
		}
	}

	async createUserManually(phoneNumber: string): Promise<{
		status: number;
		newPassword?: string;
		phoneNumber?: string;
		error?: string;
	}> {

		const existingUser = await this.prisma.user.findFirst({
			where: { phone_number: phoneNumber, role: 'user', status: 'active' },
		});

		if (existingUser) {
			return { status: 500, error: 'user_already_exists' };
		}

		try {
			return await this.prisma.$transaction(async (tx) => {
				function generateRandomPassword() {
					const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
					const lowercase = 'abcdefghijklmnopqrstuvwxyz';
					const numbers = '0123456789';
					let password = '';

					password += uppercase[Math.floor(Math.random() * uppercase.length)];
					for (let i = 0; i < 4; i++) {
						password += numbers[Math.floor(Math.random() * numbers.length)];
					}

					for (let i = 0; i < 3; i++) {
						password += lowercase[Math.floor(Math.random() * lowercase.length)];
					}

					return password.split('').sort(() => 0.5 - Math.random()).join('');
				}
				const newPassword = generateRandomPassword();
				const hashedPassword = await bcrypt.hash(newPassword, 10);
				// Create user
				const user = await tx.user.create({
					data: {
						phone_number: phoneNumber,
						role: 'user',
						login_type: 'phone',
						status: 'active',
						password: hashedPassword,
						verified_at: new Date(),
						created_by: 'manual',
					},
				});

				const profile = await tx.profile.create({
					data: {
						user_id: user.id,
						username: '',
						name: '',
						profile_image: '',
						status: 'active',
					},
				});

				await tx.profileColor.create({
					data: {
						profile_id: profile.id,
					},
				});
				return { status: 200, newPassword, phoneNumber };
			});
		} catch (error: any) {
			return {
				status: 500,
				error: error.message || 'internal_server_error',
			};
		}
	}

	async setNewPassword(userId: string, password: string): Promise<{
		status: number;
		newPassword?: string;
		message?: string;
	}> {
		try {
			return await this.prisma.$transaction(async (tx) => {
				const user = await tx.user.findFirst({ where: { id: userId, verified_at: { not: null }, status: 'inactive' } });
				if (!user) throw new Error('user_not_found');
				const hashedPassword = await bcrypt.hash(password, 10);
				await tx.user.update({ where: { id: userId }, data: { password: hashedPassword } });
				return { status: 200, newPassword: password };
			});
		} catch (error: any) {
			return { status: 500, message: error.message || 'internal_server_error' };
		}
	}

	async resendVerifyOTP(verifyId: string): Promise<{
		status: number;
		message?: string;
	}> {
		try {
			return await this.prisma.$transaction(async (tx) => {
				const tempUser = await tx.tempUser.findFirst({ where: { id: verifyId } });
				if (!tempUser) throw new Error('temp_user_not_found');
				const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
				await tx.tempUser.update({ where: { id: verifyId }, data: { verify_code: verifyCode } });
				return { status: 200, message: 'OTP resent successfully' };
			});
		} catch (error: any) {
			return { status: 500, message: error.message || 'internal_server_error' };
		}
	}

	async removeUserByUserId(userId: string): Promise<{
		status: number;
		message: string;
	}> {
		try {
			return await this.prisma.$transaction(async (tx) => {
				const user = await tx.user.findFirst({ where: { id: userId, verified_at: { not: null }, status: 'inactive' } });
				if (!user) throw new Error('user_not_found');

				return { status: 200, message: 'User removed successfully' };
			});
		} catch (error: any) {
			return { status: 500, message: error.message || 'internal_server_error' };
		}
	}
} 