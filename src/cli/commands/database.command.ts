import { Command, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';

@Command({ 
  name: 'db', 
  description: 'Database management commands'
})
export class DatabaseCommand extends CommandRunner {
  private path?: string;

  constructor() {
    super();
  }

  @Option({
    flags: '-p, --path <path>',
    description: 'Custom path for seeder file',
  })
  parsePath(val: string): string {
    return val;
  }

  async run(passedParams: string[], options?: any): Promise<void> {
    const command = passedParams[0];
    
    // Store the path option
    this.path = options?.path;
    
    // If no command or 'sync', do the common workflow
    if (!command || command === 'sync') {
      await this.sync();
      return;
    }
    
    switch (command) {
      case 'generate':
        await this.generate();
        break;
      case 'migrate':
        await this.migrate(passedParams[1]);
        break;
      case 'migrate:dev':
        await this.migrateDev(passedParams[1]);
        break;
      case 'migrate:deploy':
        await this.migrateDeploy();
        break;
      case 'migrate:reset':
        await this.migrateReset();
        break;
      case 'migrate:status':
        await this.migrateStatus();
        break;
      case 'db:push':
        await this.dbPush();
        break;
      case 'db:pull':
        await this.dbPull();
        break;
      case 'seed':
        await this.seed(passedParams[1]);
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

  private async sync(): Promise<void> {
    try {
      console.log('🚀 Syncing database schema...');
      
      // Generate Prisma client
      console.log('🔄 Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      console.log('✅ Database schema synced successfully!');
      console.log('💡 Ready to use your updated schema and client');
    } catch (error) {
      console.error('❌ Failed to sync database schema:', error.message);
      process.exit(1);
    }
  }

  private async generate(): Promise<void> {
    try {
      console.log('🔄 Generating Prisma client...');
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
        execSync(`npx prisma migrate dev --name ${name}`, { stdio: 'inherit' });
      } else {
        console.log('🔄 Applying migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      }
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }

  private async migrateDev(name?: string): Promise<void> {
    try {
      if (name) {
        console.log(`🔄 Creating development migration: ${name}`);
        execSync(`npx prisma migrate dev --name ${name}`, { stdio: 'inherit' });
      } else {
        console.log('🔄 Creating development migration...');
        execSync('npx prisma migrate dev', { stdio: 'inherit' });
      }
      console.log('✅ Development migration completed successfully!');
    } catch (error) {
      console.error('❌ Development migration failed:', error.message);
      process.exit(1);
    }
  }

  private async migrateDeploy(): Promise<void> {
    try {
      console.log('🚀 Deploying migrations to production...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations deployed successfully!');
    } catch (error) {
      console.error('❌ Migration deployment failed:', error.message);
      process.exit(1);
    }
  }

  private async migrateReset(): Promise<void> {
    try {
      console.log('🔄 Resetting database and migrations...');
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      console.log('✅ Database reset successfully!');
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      process.exit(1);
    }
  }

  private async migrateStatus(): Promise<void> {
    try {
      console.log('📊 Migration Status:');
      execSync('npx prisma migrate status', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to get migration status:', error.message);
      process.exit(1);
    }
  }

  private async dbPush(): Promise<void> {
    try {
      console.log('🚀 Pushing schema to database...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Schema pushed successfully!');
    } catch (error) {
      console.error('❌ Schema push failed:', error.message);
      process.exit(1);
    }
  }

  private async dbPull(): Promise<void> {
    try {
      console.log('📥 Pulling schema from database...');
      execSync('npx prisma db pull', { stdio: 'inherit' });
      console.log('✅ Schema pulled successfully!');
    } catch (error) {
      console.error('❌ Schema pull failed:', error.message);
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

  private async seed(seedType?: string): Promise<void> {
    try {
      // Check for custom path option
      if (this.path) {
        console.log(`🌱 Seeding from custom path: ${this.path}...`);
        execSync(`ts-node --transpile-only prisma/${this.path}.ts`, { stdio: 'inherit' });
        console.log('✅ Custom seeder executed successfully!');
        return;
      }

      // If no seedType specified, run index.ts for ordered seeding
      if (!seedType || seedType === 'all') {
        console.log('🌱 Running ordered seeders from prisma/seeds/index.ts ...');
        execSync('ts-node --transpile-only prisma/seeds/index.ts', { stdio: 'inherit' });
        return;
      }

      // Run specific seeder
      console.log(`🌱 Seeding ${seedType}...`);
      execSync(`ts-node --transpile-only prisma/seeds/${seedType}.ts`, { stdio: 'inherit' });
      console.log('✅ Database seeded successfully!');
    } catch (error) {
      console.error('❌ Failed to seed database:', error.message);
      process.exit(1);
    }
  }

  private async studio(): Promise<void> {
    try {
      console.log('🎨 Opening Prisma Studio...');
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
    console.log('\n🗄️ Database Management Commands');
    console.log('\nUsage:');
    console.log('  cli db                    # Default: generate Prisma client');
    console.log('  cli db [command]          # Specific command');
    
    console.log('\n⚡ Quick Commands:');
    console.log('  cli db                    Generate Prisma client');
    
    console.log('\n🔧 Migration Commands:');
    console.log('  generate                  Generate Prisma client only');
    console.log('  migrate [name]            Create/apply migrations (alias for migrate:dev)');
    console.log('  migrate:dev [name]        Create development migration');
    console.log('  migrate:deploy            Deploy migrations to production');
    console.log('  migrate:reset             Reset database and migrations (⚠️ DESTRUCTIVE)');
    console.log('  migrate:status            Show migration status');
    
    console.log('\n🗄️ Schema Commands:');
    console.log('  db:push                   Push schema to database');
    console.log('  db:pull                   Pull schema from database');
    
    console.log('\n🌱 Seeding Commands:');
    console.log('  seed                      Run all seeders in prisma/seeds/ folder');
    console.log('  seed [type]               Run specific seeder (permissions, users, etc.)');
    console.log('  seed --path=path/to/file  Run custom seeder from specific path');
    
    console.log('\n🛠️ Utility Commands:');
    console.log('  studio                    Open Prisma Studio');
    console.log('  status                    Show migration status');
    console.log('  health                    Database health check');
    
    console.log('\n⚠️  Warning: migrate:reset will delete all data and reset migrations!');
    
    process.exit(0);
  }
}