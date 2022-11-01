import { Inject, Logger } from '@nestjs/common';
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
//import { Auth } from './auth.service';

@WebSocketGateway(8084, {
	cors : {
		origin : "*",
	}
  //path: '/', // can look into path
  //serveClient: true,
  //namespace: '/',
})
export class ApiGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('ApiGateway');
  
  //private clientList: { userID: number };

  constructor(@Inject(Sockets) private readonly sockets : Sockets, /*@Inject(Auth) private readonly auth: Auth*/) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  // TODO: make sure it is storing the userID
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected: ${client.id}');
    //this.sockets.storeSocket(args[0] as number, client); 
    client.emit('wssTest', {message : "Connected to the websocketServer"});
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected: ${client.id}');
  }


  //@SubscribeMessage('message')
  //handleMessage(client: Socket, payload: any): string {
  //  //client = chat-appendFile
  //  //client.send(pattern, payload);
  //  return 'Hello world!';
  //}
}
