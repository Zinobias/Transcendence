import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Sockets } from './sockets.class';
import { Auth } from './auth.service';

export enum Destination {
  GAME_SERVICE,
  CHAT_SERVICE,
}

export interface FrontEndDTO {
  eventPattern: string;
  payload: {};
}

@WebSocketGateway(8084, {
  cors: {
    origin: '*',
  },
  //path: '/', // can look into path
  //serveClient: true,
  //namespace: '/',
})
export class ApiGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('ApiGateway');

  async onApplicationBootstrap() {
    console.log('bootstrap gateway');
    // this.gameClient.connect();
    this.gameClient.emit('testMsg', 'msg from frontend');
    this.chatClient.emit('testMsg', 'msg from frontend');
  }
  //private clientList: { userID: number };

  constructor(
    @Inject(Sockets)
    private readonly sockets: Sockets,
    @Inject('GAME_SERVICE') private gameClient: ClientProxy,
    @Inject('CHAT_SERVICE') private chatClient: ClientProxy,
    @Inject(Auth) private auth: Auth,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  // TODO: make sure it is storing the userID
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected: ${client.id}' + ' ' + args[0]);
    // this.sockets.storeSocket(args[0] as number, client); /*This shouldn't be needed as auth handles that*/
    client.emit('wssTest', { message: 'Connected to the websocketServer' }); // relays back to frontend
    this.gameClient.send('testMsg', { message: 'random message from gateway' }); // to game
    this.gameClient.emit('testMsg', 'user connected to frontend');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected: ${client.id}');
  }

  @SubscribeMessage('chat')
  handleChat(client: Socket, payload: FrontEndDTO) {
    //TODO verify auth
    this.chatClient.emit(payload.eventPattern, payload.payload);
  }

  @SubscribeMessage('game')
  handleGame(client: Socket, payload: FrontEndDTO) {
    //TODO verify auth
    this.gameClient.emit(payload.eventPattern, payload.payload);
  }
}
