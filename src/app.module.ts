import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { PrismaModule } from './core/prisma/prisma.module';
import { SchemaLoaderService } from '@shared/schema';
import { SchemaModule } from '@shared/schema/schema.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({})
export class AppModule {
  static async forRoot(): Promise<DynamicModule> {
    const schemaLoader = new SchemaLoaderService();
    
    // Dynamically load all modules
    const discoveredModules = await schemaLoader.loadAllModules();
    
    // Get schema paths
    const schemaPaths = await schemaLoader.loadAllSchemas();
    
    // Validate schemas
    const { valid, missing } = await schemaLoader.validateSchemas();
    if (missing.length > 0) {
      console.warn('Modules without schema files:', missing);
    }
    
    console.log('Discovered modules:', discoveredModules.map(m => m.name));
    console.log('Loaded schemas:', valid);
    console.log('Schema paths:', schemaPaths);

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig, jwtConfig],
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute
          },
        ]),
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          typePaths: schemaPaths,
          definitions: {
            path: join(process.cwd(), 'src/graphql.ts'),
          },
          sortSchema: true,
          playground: true,
          introspection: true,
          context: ({ req }) => ({ req }),
        }),
        PrismaModule,
        SchemaModule,
        ...discoveredModules, // Dynamically include all discovered modules
      ],
    };
  }
}
