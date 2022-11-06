import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8080).then(() => {console.log("gateway is listening");});
//   app.connectMicroservice({
// 	name: 'GAME_SERVICE',
//         transport: Transport.TCP,
//         options: {
//           host: '127.0.0.1',
//           port: 3001,
// 		}
//   })
//   app.startAllMicroservices();
}


bootstrap();
