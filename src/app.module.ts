import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { PrismaModule } from 'shared/prisma';
import { SecurityService } from 'shared/services/security.service';
import databaseConfig from '@config/database.config';
import jwtConfig from '@config/jwt.config';
import securityConfig from '@config/security.config';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ContactModule } from './modules/contact/contact.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AdminModule } from './modules/admin/admin.module';
import { PermissionsModule } from 'shared/modules/permissions.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, securityConfig],
    }),

    // Prisma
    PrismaModule,

    // Shared modules
    PermissionsModule,

    // Modules
    AuthModule,
    UserModule,
    ContactModule,
    ProfileModule,
    AdminModule,

    // Throttler
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('security.throttling.ttl') || 60000,
          limit: configService.get('security.throttling.limit') || 10,
        },
      ],
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
    }),
  ],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class AppModule { }
