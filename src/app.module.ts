import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { PrismaModule } from '@common/prisma';
import { ModuleLoaderService } from '@common/modules';
import { SecurityService } from '@common/services/security.service';
import databaseConfig from '@config/database.config';
import jwtConfig from '@config/jwt.config';
import securityConfig from '@config/security.config';

@Module({})
export class AppModule {
  static async forRoot(): Promise<DynamicModule> {
    const moduleLoader = new ModuleLoaderService();
    
    // Dynamically load all modules
    const discoveredModules = await moduleLoader.loadAllModules();
    
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
        }),
        PrismaModule,
        ...discoveredModules,
      ],
      providers: [
        SecurityService,
      ],
      exports: [SecurityService],
    };
  }
}
