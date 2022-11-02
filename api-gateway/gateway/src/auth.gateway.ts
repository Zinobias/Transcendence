import { Inject, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'typeorm';
import { AuthData } from './auth.objects';
import { AuthServices } from './auth.service';
import { Sockets } from './sockets.class';
@WebSocketGateway(8081, {
  path: '/', // can look into path
  serveClient: true,
  namespace: '/auth',
})
export class AuthGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(@Inject(Sockets) private readonly sockets: Sockets) {}
  private authServices: AuthServices = new AuthServices(this.sockets);
  private logger: Logger = new Logger('auth gateway');

  @SubscribeMessage('auth')
  handleMessage(client: Socket, data: AuthData) {
    this.authServices.auth(client, data);
  }

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Auth client connected: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Auth client disconnected: ' + client.id);
  }

  @WebSocketServer() wss: Server;
}
