import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from 'shared/prisma';
import { JwtAuthGuard } from './auth.guard';
import { PermissionsModule } from 'shared/modules/permissions.module';
import './entities';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    PermissionsModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule { } 