import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditLog, AuditStatus } from '@prisma/client';
import {
  CreateAuditLogInput,
  AuditFilters,
  AuditContext,
  AuditAction,
} from './audit.interface';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: CreateAuditLogInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        status: data.status || AuditStatus.SUCCESS,
      }
    });
  }

  async logSuccess(data: CreateAuditLogInput): Promise<AuditLog> {
    return this.log({
      ...data,
      status: AuditStatus.SUCCESS,
    });
  }

  async logFailure(data: CreateAuditLogInput, error: string): Promise<AuditLog> {
    return this.log({
      ...data,
      status: AuditStatus.FAILED,
      errorMessage: error,
    });
  }

  async logUserAction(
    userId: number,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
    context?: AuditContext
  ): Promise<AuditLog> {
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
    userId?: number,
    success: boolean = true,
    details?: any,
    context?: AuditContext
  ): Promise<AuditLog> {
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

  async findAll(filters?: AuditFilters): Promise<AuditLog[]> {
    const where: any = {};
    
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }
    
    return this.prisma.auditLog.findMany({ where });
  }

  async findById(id: number): Promise<AuditLog | null> {
    return this.prisma.auditLog.findUnique({
      where: { id }
    });
  }

  async findByUser(userId: number, filters?: AuditFilters): Promise<AuditLog[]> {
    const where: any = { userId };
    
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.status) where.status = filters.status;
    
    return this.prisma.auditLog.findMany({ where });
  }

  async getActionCounts(filters?: AuditFilters): Promise<Record<string, number>> {
    const logs = await this.findAll(filters);
    const counts: Record<string, number> = {};
    
    logs.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });
    
    return counts;
  }

  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });
    
    return result.count;
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