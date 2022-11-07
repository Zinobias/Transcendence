import { Module } from '@nestjs/common';
import { ApiGateway } from './api.gateway';
import { ApiController } from './api/api.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Sockets } from './sockets.class';
import { Auth } from './auth.service';
import { Database } from './database/data-source';
import { Queries } from './database/queries';
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
          port: 8080,
        },
      },
    ]),
  ],
  controllers: [ApiController],
  providers: [Sockets, Auth, ApiGateway, Database, Queries],
})
export class AppModule {}
