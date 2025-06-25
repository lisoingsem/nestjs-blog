import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { PrismaModule } from './core/prisma/prisma.module';
import { SchemaLoaderService } from '@shared/schema';
import { GlobalAuthGuard } from '@shared/guards';
import { SecurityService } from '@shared/services';
import databaseConfig from '@config/database.config';
import jwtConfig from '@config/jwt.config';
import securityConfig from '@config/security.config';

@Module({})
export class AppModule {
  static async forRoot(): Promise<DynamicModule> {
    const schemaLoader = new SchemaLoaderService();
    
    // Dynamically load all modules
    const discoveredModules = await schemaLoader.loadAllModules();
    
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig, jwtConfig, securityConfig],
        }),
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
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: true,
          introspection: true,
          context: ({ req }) => ({ 
            req,
            isAuthenticated: !!req.user,
            user: req.user,
          }),
        }),
        PrismaModule,
        ...discoveredModules,
      ],
      providers: [
        SecurityService,
        {
          provide: 'APP_GUARD',
          useClass: GlobalAuthGuard,
        },
      ],
      exports: [SecurityService],
    };
  }
}
