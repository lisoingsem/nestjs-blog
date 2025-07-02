import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { softDeleteMiddleware } from './soft-delete.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('database.url'),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
      this.$use(softDeleteMiddleware());
    } catch (error) {
      this.logger.error('❌ Failed to connect to database', error);
      throw error;
    }
  }
  
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('📡 Database disconnected');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from database', error);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$executeRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw new Error('Database is unhealthy');
    }
  }

  // Transaction wrapper with automatic retry
  async executeTransaction<T>(
    operations: (prisma: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      retries?: number;
    }
  ): Promise<T> {
    const { retries = 3, ...txOptions } = options || {};
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.$transaction(operations, txOptions);
      } catch (error) {
        this.logger.warn(`Transaction attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          this.logger.error('All transaction attempts failed', error);
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
    
    throw new Error('Transaction failed after all retries');
  }

  // Batch operations helper
  async batchExecute<T>(
    operations: (() => Promise<T>)[],
    options?: { batchSize?: number; concurrency?: number }
  ): Promise<T[]> {
    const { batchSize = 10, concurrency = 3 } = options || {};
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchPromises = batch.map(async (operation, index) => {
        try {
          return await operation();
        } catch (error) {
          this.logger.error(`Batch operation ${i + index} failed:`, error);
          throw error;
        }
      });
      
      // Execute with limited concurrency
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Soft delete helper
  async softDelete(model: string, where: any): Promise<any> {
    return this[model].update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  // Restore soft deleted record
  async restore(model: string, where: any): Promise<any> {
    return this[model].update({
      where,
      data: { deletedAt: null },
    });
  }

  // Get database statistics
  async getDatabaseStats(): Promise<{
    tableStats: Record<string, number>;
    connectionInfo: any;
  }> {
    const models = Object.keys(this).filter(key => 
      typeof this[key] === 'object' && 
      this[key] !== null && 
      'findMany' in this[key]
    );

    const tableStats: Record<string, number> = {};
    
    for (const model of models) {
      try {
        tableStats[model] = await this[model].count();
      } catch (error) {
        this.logger.warn(`Failed to get count for ${model}:`, error);
        tableStats[model] = -1;
      }
    }

    const connectionInfo = {
      connected: true,
      timestamp: new Date(),
    };

    return { tableStats, connectionInfo };
  }

  // Clean old records (for maintenance)
  async cleanOldRecords(
    model: string, 
    dateField: string, 
    olderThanDays: number
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this[model].deleteMany({
      where: {
        [dateField]: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned ${result.count} old records from ${model}`);
    return result.count;
  }
} 