import { Module } from '@nestjs/common';
import { SchemaLoaderService } from './schema-loader.service';

@Module({
  providers: [SchemaLoaderService],
  exports: [SchemaLoaderService],
})
export class SchemaModule {} 