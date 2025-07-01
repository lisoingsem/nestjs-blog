import { Command, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Command({ 
  name: 'db', 
  description: 'Database management commands'
})
export class DatabaseCommand extends CommandRunner {
  constructor() {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const command = passedParams[0];
    
    // If no command or 'sync', do the common workflow
    if (!command || command === 'sync') {
      await this.sync(passedParams.slice(1));
      return;
    }
    
    switch (command) {
      case 'merge':
        await this.merge(passedParams.slice(1));
        break;
      case 'generate':
        await this.generate();
        break;
      case 'migrate':
        await this.migrate(passedParams[1]);
        break;
      case 'seed':
        await this.seed();
        break;
      case 'studio':
        await this.studio();
        break;
      case 'status':
        await this.status();
        break;
      case 'health':
        await this.health();
        break;
      default:
        this.showHelp();
    }
  }

  private async sync(modules: string[] = []): Promise<void> {
    try {
      console.log('🚀 Syncing database schema...');
      
      // Step 1: Merge schemas
      if (modules.length > 0) {
        console.log(`🔄 Merging schema files for: ${modules.join(', ')}`);
        this.mergeSchemaFiles(modules);
      } else {
        console.log('🔄 Merging all schema files...');
        this.mergeSchemaFiles();
      }
      
      // Step 2: Generate Prisma client
      console.log('🔄 Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      console.log('✅ Database schema synced successfully!');
      console.log('💡 Ready to use your updated schema and client');
    } catch (error) {
      console.error('❌ Failed to sync database schema:', error.message);
      process.exit(1);
    }
  }

  private async merge(modules: string[] = []): Promise<void> {
    try {
      if (modules.length > 0) {
        console.log(`🔄 Merging schema files for: ${modules.join(', ')}`);
        this.mergeSchemaFiles(modules);
      } else {
        console.log('🔄 Merging all schema files...');
        this.mergeSchemaFiles();
      }
      console.log('✅ Schema files merged successfully!');
    } catch (error) {
      console.error('❌ Failed to merge schema files:', error.message);
      process.exit(1);
    }
  }

  private mergeSchemaFiles(modules: string[] = []): void {
    let schemaFiles: string[];
    
    if (modules.length > 0) {
      // Build file paths from specified modules
      schemaFiles = modules.map(module => {
        const [location, moduleName] = module.split('/');
        if (location === 'core') {
          return `src/core/${moduleName}/${moduleName}.prisma`;
        } else if (location === 'modules') {
          return `src/modules/${moduleName}/${moduleName}.prisma`;
        } else {
          // Try to infer the path
          return `src/core/${module}/${module}.prisma`;
        }
      });
    } else {
      // Default: merge all known core schemas
      schemaFiles = [
        'src/core/users/users.prisma',
        'src/core/permissions/permission.prisma', 
        'src/core/audit/audit.prisma'
      ];
    }

    let mergedContent = `// Auto-generated schema from modular files
// Last updated: ${new Date().toISOString()}
// Merged modules: ${modules.length > 0 ? modules.join(', ') : 'all core modules'}

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

    let mergedCount = 0;
    schemaFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf8');
        // Remove generator and datasource blocks from individual files
        const cleanContent = content
          .replace(/generator\s+\w+\s*\{[^}]*\}/g, '')
          .replace(/datasource\s+\w+\s*\{[^}]*\}/g, '')
          .trim();
        
        if (cleanContent) {
          mergedContent += `\n// From ${file}\n${cleanContent}\n`;
          mergedCount++;
        }
      } catch (error) {
        console.warn(`⚠️ Warning: Could not read ${file}`);
      }
    });

    if (mergedCount === 0) {
      throw new Error('No valid schema files found to merge');
    }

    writeFileSync('prisma/schema.prisma', mergedContent);
    console.log(`📊 Merged ${mergedCount} schema file(s)`);
  }

  private async generate(): Promise<void> {
    try {
      console.log('🔄 Generating Prisma client...');
      this.mergeSchemaFiles();
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully!');
    } catch (error) {
      console.error('❌ Failed to generate client:', error.message);
      process.exit(1);
    }
  }

  private async migrate(name?: string): Promise<void> {
    try {
      if (name) {
        console.log(`🔄 Creating migration: ${name}`);
        this.mergeSchemaFiles();
        execSync(`npx prisma migrate dev --name ${name}`, { stdio: 'inherit' });
      } else {
        console.log('🔄 Applying migrations...');
        this.mergeSchemaFiles();
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      }
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }

  private async status(): Promise<void> {
    try {
      console.log('📊 Database Status:');
      execSync('npx prisma migrate status', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to get status (DATABASE_URL required)');
      process.exit(1);
    }
  }

  private async seed(): Promise<void> {
    try {
      console.log('🌱 Seeding database...');
      execSync('ts-node --transpile-only prisma/seed.ts', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully!');
    } catch (error) {
      console.error('❌ Failed to seed database (DATABASE_URL required)');
      process.exit(1);
    }
  }

  private async studio(): Promise<void> {
    try {
      console.log('🎨 Opening Prisma Studio...');
      this.mergeSchemaFiles();
      execSync('npx prisma studio', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to open Prisma Studio:', error.message);
      process.exit(1);
    }
  }

  private async health(): Promise<void> {
    try {
      console.log('🏥 Running health check...');
      execSync('npx prisma db execute --stdin <<< "SELECT 1"', { stdio: 'pipe' });
      console.log('✅ Database connection is healthy');
    } catch (error) {
      console.error('❌ Health check failed (DATABASE_URL required)');
      process.exit(1);
    }
  }

  private showHelp(): void {
    console.log('\n🚀 Database Commands');
    console.log('\nUsage:');
    console.log('  cli db [modules...]       # Default: merge schemas + generate client');
    console.log('  cli db [command]          # Specific command');
    
    console.log('\n⚡ Quick Commands:');
    console.log('  cli db                    Sync all schemas and generate client');
    console.log('  cli db users              Sync only users module');
    console.log('  cli db core/audit         Sync only audit from core');
    
    console.log('\n🔧 Specific Commands:');
    console.log('  merge [modules...]        Merge schemas only (no client generation)');
    console.log('  generate                  Generate Prisma client only');
    console.log('  migrate [name]            Create/apply migrations');
    console.log('  seed                      Seed database with sample data');
    console.log('  studio                    Open Prisma Studio');
    console.log('  status                    Show migration status');
    console.log('  health                    Database health check');
    
    process.exit(0);
  }
}