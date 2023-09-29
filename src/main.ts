import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfiguration } from '../config/storage.configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(StorageConfiguration.photo.destination,{
      prefix:StorageConfiguration.photo.urlPrefix,
      index:false
  })
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
