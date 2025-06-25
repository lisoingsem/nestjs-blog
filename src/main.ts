import 'reflect-metadata';
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule.forRoot());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
