import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestCloud } from '@nestcloud/core';

async function bootstrap() {
  const app = NestCloud.create(await NestFactory.create(AppModule));
  // const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}

bootstrap();
