import { Prisma } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Cache for models with soft delete
let modelsWithSoftDelete: string[] | null = null;

function getModelsWithSoftDelete(): string[] {
  if (modelsWithSoftDelete) {
    return modelsWithSoftDelete;
  }

  try {
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    
    // Parse schema to find models with deletedAt field
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    const models: string[] = [];
    
    let match;
    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelContent = match[2];
      
      // Check if model has deletedAt field
      if (modelContent.includes('deletedAt') || modelContent.includes('deleted_at')) {
        models.push(modelName);
      }
    }
    
    modelsWithSoftDelete = models;
    return models;
  } catch (error) {
    console.warn('Could not detect models with soft delete, using fallback:', error.message);
    return [];
  }
}

export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (
      ['findUnique', 'findFirst', 'findMany'].includes(params.action) &&
      params.model &&
      params.args
    ) {
      // Dynamically detect models with soft delete
      const modelsWithSoftDelete = getModelsWithSoftDelete();
      
      if (modelsWithSoftDelete.includes(params.model)) {
        // Only filter if not explicitly requesting deleted records
        if (!params.args.withDeleted) {
          if (!params.args.where) {
            params.args.where = {};
          }
          params.args.where.deletedAt = null;
        } else {
          // Remove the withDeleted flag so it doesn't interfere with the query
          delete params.args.withDeleted;
        }
      }
    }
    
    return next(params);
  };
} 