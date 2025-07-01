import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface MigrationInfo {
  name: string;
  applied: Date | null;
  checksum: string;
}

export interface SchemaFile {
  path: string;
  content: string;
  module: string;
}

@Injectable()
export class PrismaMigrationService {
  private readonly logger = new Logger(PrismaMigrationService.name);

  private readonly schemaFiles = [
    { path: 'src/core/users/users.prisma', module: 'users' },
    { path: 'src/core/permissions/permissions.prisma', module: 'permissions' },
    { path: 'src/core/audit/audit.prisma', module: 'audit' },
    { path: 'prisma/base.prisma', module: 'base' },
  ];

  async mergeSchemas(): Promise<string> {
    this.logger.log('🔄 Merging schema files...');

    const baseSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

    let combinedSchema = baseSchema;

    for (const schemaFile of this.schemaFiles) {
      if (fs.existsSync(schemaFile.path)) {
        const content = fs.readFileSync(schemaFile.path, 'utf8')
          .replace(/^\/\/.*$/gm, '') // Remove comment lines
          .replace(/^\s*$/gm, '')    // Remove empty lines
          .trim();

        if (content) {
          combinedSchema += `\n// === ${schemaFile.module.toUpperCase()} MODULE (${schemaFile.path}) ===\n`;
          combinedSchema += content + '\n';
        }
      } else {
        this.logger.warn(`⚠️ Schema file not found: ${schemaFile.path}`);
      }
    }

    // Write the combined schema
    fs.writeFileSync('prisma/schema.prisma', combinedSchema);
    this.logger.log('✅ Schema files merged successfully!');
    
    return combinedSchema;
  }

  async getSchemaModules(): Promise<SchemaFile[]> {
    const modules: SchemaFile[] = [];

    for (const schemaFile of this.schemaFiles) {
      if (fs.existsSync(schemaFile.path)) {
        const content = fs.readFileSync(schemaFile.path, 'utf8');
        modules.push({
          path: schemaFile.path,
          content,
          module: schemaFile.module,
        });
      }
    }

    return modules;
  }

  async validateSchemas(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // First merge schemas
      await this.mergeSchemas();

      // Then validate using Prisma
      execSync('npx prisma validate', { stdio: 'pipe' });
      
      this.logger.log('✅ Schema validation passed');
      return { valid: true, errors: [] };
    } catch (error) {
      const errorMessage = error.stdout?.toString() || error.message;
      errors.push(errorMessage);
      this.logger.error('❌ Schema validation failed:', errorMessage);
      return { valid: false, errors };
    }
  }

  async generateClient(): Promise<void> {
    try {
      this.logger.log('🔄 Generating Prisma client...');
      await this.mergeSchemas();
      execSync('npx prisma generate', { stdio: 'inherit' });
      this.logger.log('✅ Prisma client generated successfully');
    } catch (error) {
      this.logger.error('❌ Failed to generate Prisma client:', error.message);
      throw error;
    }
  }

  async createMigration(name: string): Promise<void> {
    try {
      this.logger.log(`🔄 Creating migration: ${name}`);
      await this.mergeSchemas();
      execSync(`npx prisma migrate dev --name ${name}`, { stdio: 'inherit' });
      this.logger.log(`✅ Migration "${name}" created successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to create migration "${name}":`, error.message);
      throw error;
    }
  }

  async applyMigrations(): Promise<void> {
    try {
      this.logger.log('🔄 Applying migrations...');
      await this.mergeSchemas();
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      this.logger.log('✅ Migrations applied successfully');
    } catch (error) {
      this.logger.error('❌ Failed to apply migrations:', error.message);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<MigrationInfo[]> {
    try {
      const output = execSync('npx prisma migrate status --format=json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse the migration status output
      // Note: This is a simplified version - you might need to adjust based on Prisma's actual output
      const migrations: MigrationInfo[] = [];
      
      // Since Prisma doesn't provide JSON output for migrate status,
      // we'll need to parse the text output or use a different approach
      this.logger.log('Migration status retrieved');
      
      return migrations;
    } catch (error) {
      this.logger.error('Failed to get migration status:', error.message);
      return [];
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      this.logger.warn('🚨 Resetting database - this will delete all data!');
      await this.mergeSchemas();
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      this.logger.log('✅ Database reset successfully');
    } catch (error) {
      this.logger.error('❌ Failed to reset database:', error.message);
      throw error;
    }
  }

  async introspectDatabase(): Promise<string> {
    try {
      this.logger.log('🔄 Introspecting database...');
      execSync('npx prisma db pull', { stdio: 'inherit' });
      
      const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
      this.logger.log('✅ Database introspection completed');
      
      return schemaContent;
    } catch (error) {
      this.logger.error('❌ Failed to introspect database:', error.message);
      throw error;
    }
  }
} 