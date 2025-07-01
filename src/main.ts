import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule.forRoot());

  app.use(passport.initialize());
  app.use(helmet());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
