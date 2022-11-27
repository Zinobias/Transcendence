// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
//
// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(8080);
// }
// bootstrap();
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import {Queries} from "./Database/Queries";

const logger = new Logger('Main');
async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        // might change the hostname
        host: 'chat-app',
        port: 8080,
      },
    },
  );
  await app.listen().then(() => {
    logger.log('Microservice is listening');
    Queries.getInstance();
  });
}

bootstrap();
