import { Prisma } from '@prisma/client';
import { join } from 'path';
import { readFileSync } from 'fs';

// Read the Prisma schema to get model names
const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
let schemaContent = '';
try {
  schemaContent = readFileSync(schemaPath, 'utf-8');
} catch (error) {
  console.warn('Could not read Prisma schema file');
}

// Extract model names from schema
const modelNames = schemaContent
  .split('\n')
  .filter(line => line.trim().startsWith('model '))
  .map(line => line.replace('model ', '').replace(' {', ''))
  .filter(name => name.length > 0);

export const softDeleteMiddleware = (): Prisma.Middleware => {
  return async (params, next) => {
    // Only apply to models that have deletedAt field
    const modelsWithSoftDelete = modelNames.filter(name => {
      const modelBlock = schemaContent
        .split('model ' + name + ' {')[1]
        ?.split('}')[0];
      return modelBlock && modelBlock.includes('deletedAt');
    });

    if (params.model && modelsWithSoftDelete.includes(params.model)) {
      if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
        // Add deletedAt filter to exclude soft-deleted records
        if (params.args?.where) {
          params.args.where.deletedAt = null;
        } else {
          params.args = { ...params.args, where: { deletedAt: null } };
        }
      }
    }

    return next(params);
  };
}; 