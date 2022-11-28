import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Logger} from '@nestjs/common';
import {Server, Socket} from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AppGateway');

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    // private static clientMap = new Map();
    // private static socketMap = new Map();

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
        // const newVar: number = AppGateway.clientMap.get(client.id);
        // if (newVar != undefined) {
        //   AppGateway.socketMap.delete(newVar);
        // }
        // AppGateway.clientMap.delete(client.id);
    }
}
