import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Channel } from './Objects/Channel';
import { Queries } from './Database/Queries';
import { SettingType } from './Enums/SettingType';
import {
  ChannelCreate,
  ChannelJoin,
  ChannelLeave,
  ChannelPromote,
  ChannelDemote,
  ChannelKick,
  ChannelBan,
  ChannelDisband,
  ChannelMessage,
} from './Events/ChannelEvents';
import { Setting } from './Objects/Setting';
import { User } from './Objects/User';
import { AuthData } from './Events/OtherEvents';
import { randomUUID } from 'crypto';
import { Message } from './Objects/Message';

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  private static clientMap = new Map();
  private static socketMap = new Map();

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    const newVar: number = AppGateway.clientMap.get(client.id);
    if (newVar != undefined) {
      AppGateway.socketMap.delete(newVar);
    }
    AppGateway.clientMap.delete(client.id);
  }

  // @SubscribeMessage('auth')
  // auth(client: Socket, data: AuthData) {
  //   fetch('https://api.intra.42.fr/v2/oauth/token', {
  //     method: 'Post',
  //     body: JSON.stringify({
  //       grant_type: 'authorization_code',
  //       client_id: process.env.CLIENT,
  //       client_secret: process.env.SECRET,
  //       code: data.code,
  //       redirect_uri: 'http://localhost:3000',
  //     }),
  //     headers: { 'Content-Type': 'application/json' },
  //   }).then((response) => {
  //     response.json().then((result: AuthToken) => {
  //       console.log(result.access_token);
  //       fetch('https://api.intra.42.fr/v2/me', {
  //         method: 'Get',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: 'Bearer ' + result.access_token,
  //         },
  //       }).then((secondResponse) => {
  //         secondResponse.json().then((secondResult) => {
  //           console.log(secondResult.id);
  //           AppGateway.clientMap.set(client.id, secondResult.id);
  //           AppGateway.socketMap.set(secondResult.id, client);
  //           const uuid = randomUUID();
  //           Queries.getInstance()
  //             .storeAuth(secondResult.id, uuid)
  //             .then((result) => {
  //               if (result == true) {
  //                 client.emit('user_id', {
  //                   user_id: secondResult.id,
  //                   auth_cookie: uuid,
  //                 });
  //               } else {
  //                 client.emit('auth_failed', {
  //                   msg: 'Unable to store auth token',
  //                 });
  //               }
  //             });
  //         });
  //       });
  //     });
  //   });
  // }
}
