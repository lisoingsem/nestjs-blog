import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'shared/prisma';

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ'
}

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
}

export interface CreateAuditLogInput {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  status?: AuditStatus;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) { }

  async log(data: CreateAuditLogInput): Promise<any> {
    // For now, just log to console since audit table doesn't exist
    this.logger.log(`AUDIT: ${data.action} on ${data.resource} by user ${data.userId} - ${data.status}`, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return { id: Date.now(), ...data, timestamp: new Date() };
  }

  async logSuccess(data: CreateAuditLogInput): Promise<any> {
    return this.log({
      ...data,
      status: AuditStatus.SUCCESS,
    });
  }

  async logFailure(data: CreateAuditLogInput, error: string): Promise<any> {
    return this.log({
      ...data,
      status: AuditStatus.FAILED,
      errorMessage: error,
    });
  }

  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
    context?: AuditContext
  ): Promise<any> {
    return this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: {
        sessionId: context?.sessionId,
        correlationId: context?.correlationId,
      },
    });
  }

  async logAuthEvent(
    action: AuditAction,
    userId?: string,
    success: boolean = true,
    details?: any,
    context?: AuditContext
  ): Promise<any> {
    const data: CreateAuditLogInput = {
      userId,
      action,
      resource: 'auth',
      details,
      status: success ? AuditStatus.SUCCESS : AuditStatus.FAILED,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: {
        sessionId: context?.sessionId,
        correlationId: context?.correlationId,
      },
    };

    return success ? this.logSuccess(data) : this.logFailure(data, details?.error || 'Authentication failed');
  }

  async findAll(filters?: AuditFilters): Promise<any[]> {
    // For now, return empty array since we're not storing in database
    this.logger.log('AUDIT: findAll called with filters', filters);
    return [];
  }

  async findById(id: string): Promise<any | null> {
    // For now, return null since we're not storing in database
    this.logger.log('AUDIT: findById called', id);
    return null;
  }

  async findByUser(userId: string, filters?: AuditFilters): Promise<any[]> {
    // For now, return empty array since we're not storing in database
    this.logger.log('AUDIT: findByUser called', { userId, filters });
    return [];
  }

  async getActionCounts(filters?: AuditFilters): Promise<Record<string, number>> {
    // For now, return empty object since we're not storing in database
    this.logger.log('AUDIT: getActionCounts called', filters);
    return {};
  }

  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    // For now, return 0 since we're not storing in database
    this.logger.log('AUDIT: cleanupOldLogs called', retentionDays);
    return 0;
  }

  static extractContext(req: any): AuditContext {
    return {
      userId: req.user?.id,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id,
      correlationId: req.get('X-Correlation-ID'),
    };
  }
} 