import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    
    console.log('Discovered modules:', discoveredModules.map(m => m.name));

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig, jwtConfig, securityConfig],
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000, // 1 minute
            limit: 10, // 10 requests per minute
          },
        ]),
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: true,
          introspection: true,
          context: ({ req }) => ({ 
            req,
            // Add security context
            isAuthenticated: !!req.user,
            user: req.user,
          }),
        }),
        PrismaModule,
        ...discoveredModules, // Dynamically include all discovered modules
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
