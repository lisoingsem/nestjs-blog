import { Injectable, Type } from '@nestjs/common';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SchemaLoaderService {
  private readonly srcPath = join(process.cwd(), 'src');

  /**
   * Dynamically discover and load all GraphQL schema files
   */
  async loadAllSchemas(): Promise<string[]> {
    const schemaPaths: string[] = [];

    // Add base schema first (this defines Query, Mutation, and DateTime)
    const baseSchemaPath = join(this.srcPath, 'shared', 'schema', 'base.graphql');
    if (existsSync(baseSchemaPath)) {
      schemaPaths.push(baseSchemaPath);
    }

    // Discover module schemas
    const moduleSchemas = await this.discoverModuleSchemas();
    schemaPaths.push(...moduleSchemas);

    // Discover core schemas
    const coreSchemas = await this.discoverCoreSchemas();
    schemaPaths.push(...coreSchemas);

    return schemaPaths;
  }

  /**
   * Dynamically load all modules
   */
  async loadAllModules(): Promise<Type<any>[]> {
    const modules: Type<any>[] = [];

    // Path to compiled JS files
    const distModulesPath = join(process.cwd(), 'dist', 'src', 'modules');
    if (existsSync(distModulesPath)) {
      const moduleDirs = readdirSync(distModulesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const moduleDir of moduleDirs) {
        const moduleFile = join(distModulesPath, moduleDir, `${moduleDir}.module.js`);
        if (existsSync(moduleFile)) {
          try {
            const moduleImport = require(moduleFile);
            const moduleClass = Object.values(moduleImport).find(
              (exported: any) =>
                typeof exported === 'function' &&
                exported.name &&
                exported.name.endsWith('Module')
            ) as Type<any>;
            if (moduleClass) {
              modules.push(moduleClass);
              console.log(`✅ Successfully loaded module: ${moduleDir}`);
            } else {
              console.warn(`⚠️ No module class found in ${moduleFile}`);
            }
          } catch (error) {
            console.warn(`❌ Failed to load module ${moduleDir}:`, error.message);
          }
        }
      }
    }

    // Path to compiled JS files for core modules
    const distCorePath = join(process.cwd(), 'dist', 'src', 'core');
    if (existsSync(distCorePath)) {
      const coreDirs = readdirSync(distCorePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const coreDir of coreDirs) {
        const moduleFile = join(distCorePath, coreDir, `${coreDir}.module.js`);
        if (existsSync(moduleFile)) {
          try {
            const moduleImport = require(moduleFile);
            const moduleClass = Object.values(moduleImport).find(
              (exported: any) =>
                typeof exported === 'function' &&
                exported.name &&
                exported.name.endsWith('Module')
            ) as Type<any>;
            if (moduleClass) {
              modules.push(moduleClass);
              console.log(`✅ Successfully loaded core module: ${coreDir}`);
            } else {
              console.warn(`⚠️ No module class found in ${moduleFile}`);
            }
          } catch (error) {
            console.warn(`❌ Failed to load core module ${coreDir}:`, error.message);
          }
        }
      }
    }

    return modules;
  }

  /**
   * Discover GraphQL schema files in modules directory
   */
  private async discoverModuleSchemas(): Promise<string[]> {
    const modulesPath = join(this.srcPath, 'modules');
    if (!existsSync(modulesPath)) {
      return [];
    }

    const schemaPaths: string[] = [];
    const moduleDirs = readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleDir of moduleDirs) {
      const modulePath = join(modulesPath, moduleDir);
      const schemaFile = join(modulePath, `${moduleDir}.graphql`);
      
      if (existsSync(schemaFile)) {
        schemaPaths.push(schemaFile);
      }
    }

    return schemaPaths;
  }

  /**
   * Discover GraphQL schema files in core directory
   */
  private async discoverCoreSchemas(): Promise<string[]> {
    const corePath = join(this.srcPath, 'core');
    if (!existsSync(corePath)) {
      return [];
    }

    const schemaPaths: string[] = [];
    const coreDirs = readdirSync(corePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const coreDir of coreDirs) {
      const coreModulePath = join(corePath, coreDir);
      const schemaFile = join(coreModulePath, `${coreDir}.graphql`);
      
      if (existsSync(schemaFile)) {
        schemaPaths.push(schemaFile);
      }
    }

    return schemaPaths;
  }

  /**
   * Get all available modules dynamically
   */
  async getAvailableModules(): Promise<string[]> {
    const modules: string[] = [];

    // Discover modules
    const modulesPath = join(this.srcPath, 'modules');
    if (existsSync(modulesPath)) {
      const moduleDirs = readdirSync(modulesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      modules.push(...moduleDirs);
    }

    // Discover core modules
    const corePath = join(this.srcPath, 'core');
    if (existsSync(corePath)) {
      const coreDirs = readdirSync(corePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      modules.push(...coreDirs);
    }

    return modules;
  }

  /**
   * Validate schema files exist for modules
   */
  async validateSchemas(): Promise<{ valid: string[]; missing: string[] }> {
    const modules = await this.getAvailableModules();
    const valid: string[] = [];
    const missing: string[] = [];

    for (const module of modules) {
      const schemaPath = join(this.srcPath, 'modules', module, `${module}.graphql`);
      const coreSchemaPath = join(this.srcPath, 'core', module, `${module}.graphql`);
      
      if (existsSync(schemaPath) || existsSync(coreSchemaPath)) {
        valid.push(module);
      } else {
        missing.push(module);
      }
    }

    return { valid, missing };
  }
} 