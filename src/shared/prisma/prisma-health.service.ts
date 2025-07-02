import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: Date;
  details: {
    connection: boolean;
    queryTest: boolean;
    tableStats?: Record<string, number>;
    error?: string;
  };
}

@Injectable()
export class PrismaHealthService {
  private readonly logger = new Logger(PrismaHealthService.name);

  constructor(private prisma: PrismaService) {}

  async checkHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    const health: DatabaseHealth = {
      status: 'healthy',
      responseTime: 0,
      timestamp: new Date(),
      details: {
        connection: false,
        queryTest: false,
      },
    };

    try {
      // Test basic connection
      await this.prisma.healthCheck();
      health.details.connection = true;

      // Test a simple query
      await this.prisma.$executeRaw`SELECT 1`;
      health.details.queryTest = true;

      // Get table statistics
      health.details.tableStats = (await this.prisma.getDatabaseStats()).tableStats;

      health.status = 'healthy';
    } catch (error) {
      this.logger.error('Database health check failed', error);
      health.status = 'unhealthy';
      health.details.error = error.message;
    }

    health.responseTime = Date.now() - startTime;

    // Determine status based on response time
    if (health.status === 'healthy' && health.responseTime > 5000) {
      health.status = 'degraded';
    }

    return health;
  }

  async getDetailedStatus(): Promise<{
    health: DatabaseHealth;
    migrations: { applied: boolean; pending?: string[] };
    connections: { active: number; max: number };
  }> {
    const health = await this.checkHealth();

    // Check migration status (this would need to be implemented based on your needs)
    const migrations = {
      applied: true, // You could check this via Prisma's migration status
      pending: [],
    };

    // Connection info (approximated - Prisma doesn't expose this directly)
    const connections = {
      active: 1, // Current connection
      max: 10,   // Would come from your database config
    };

    return {
      health,
      migrations,
      connections,
    };
  }

  async runDiagnostics(): Promise<{
    queryPerformance: { avgResponseTime: number; queries: number };
    tableIntegrity: Record<string, boolean>;
    indexUsage: Record<string, any>;
  }> {
    const diagnostics = {
      queryPerformance: { avgResponseTime: 0, queries: 0 },
      tableIntegrity: {},
      indexUsage: {},
    };

    try {
      // Test query performance
      const startTime = Date.now();
      await this.prisma.user.count();
      await this.prisma.permission.count();
      const endTime = Date.now();
      
      diagnostics.queryPerformance = {
        avgResponseTime: (endTime - startTime) / 2,
        queries: 2,
      };

      // Check table integrity (simplified)
      const stats = await this.prisma.getDatabaseStats();
      Object.keys(stats.tableStats).forEach(table => {
        diagnostics.tableIntegrity[table] = stats.tableStats[table] >= 0;
      });

    } catch (error) {
      this.logger.error('Diagnostics failed', error);
    }

    return diagnostics;
  }
} 