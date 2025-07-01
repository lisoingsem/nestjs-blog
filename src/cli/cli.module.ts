import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseCommand } from './commands/database.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    DatabaseCommand,
  ],
})
export class CliModule {} 