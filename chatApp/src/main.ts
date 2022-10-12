import {NestFactory} from '@nestjs/core';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {WebSocketsGateway} from "./web-sockets.gateway";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      WebSocketsGateway,
      {
        transport: Transport.TCP
      },
  );
  await app.listen();
}
bootstrap().then(r => {
    console.log("idk?????")
});
