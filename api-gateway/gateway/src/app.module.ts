import { Module } from '@nestjs/common';
import { ApiGateway } from './api.gateway';
import { ApiController } from './api/api.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Sockets } from './sockets.class';
import { Auth } from './auth.service';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'GAME_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'game-app',
          port: 3001,
        },
      },
      {
        name: 'CHAT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'chat-app',
          port: 3000,
        },
      },
    ]),
  ],
  controllers: [ApiController],
  providers: [Sockets, Auth, ApiGateway],
})
export class AppModule {}
