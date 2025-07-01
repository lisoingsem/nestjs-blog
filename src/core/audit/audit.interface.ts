import { AuditStatus } from '@prisma/client';

// Audit Log Input Types
export interface CreateAuditLogInput {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  status?: AuditStatus;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  errorMessage?: string;
}

// Audit Filter Types
export interface AuditFilters {
  userId?: number;
  action?: string;
  resource?: string;
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
}

// Audit Context Types
export interface AuditContext {
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
}

// Audit Action Types
export type AuditAction = string;