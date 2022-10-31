import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Queries } from './database/queries';
import { randomUUID } from 'crypto';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(8081, {
  path: '/', // can look into path
  serveClient: true,
  namespace: '/',
})
export class ApiGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private clientList: { userID: number };

  constructor(@Inject(Auth) private readonly auth: Auth) {}

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected: ${client.id}');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected: ${client.id}');
  }

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    //client = chat-appendFile
    //client.send(pattern, payload);
    return 'Hello world!';
  }
}

@Injectable()
export class Sockets {
  private static socketMap = new Map();

  public storeSocket(userId: number, socket: Socket) {
    Sockets.socketMap.set(userId, socket);
  }

  public getSocket(userId: number): Socket | null {
    if (Sockets.socketMap.has(userId)) {
      return Sockets.socketMap.get(userId);
    }
    return null;
  }

  public sendData(users: number[], pattern: string, payload: {}) {
    for (const user of users) {
      const socket = this.getSocket(user);
      if (socket != null) {
        socket.emit(pattern, payload);
      }
    }
  }
}

@Injectable()
export class Auth {
  constructor(@Inject(Sockets) private readonly sockets: Sockets) {}
  private static map = new Map();

  public checkAuth(userId: number, accessToken: string): boolean {
    if (Auth.map.has(userId)) {
      return Auth.map.get(userId) == accessToken;
    }
    return false;
  }

  public async updateAuth(userId: number) {
    const accessToken: string | null = await Queries.getInstance().loadSession(
      userId,
    );
    if (accessToken != null) {
      Auth.map.set(userId, accessToken);
    }
  }

  @SubscribeMessage('auth')
  async auth(client: Socket, data: AuthData) {
    const oauthResponse = await fetch(
      'https://api.intra.42.fr/v2/oauth/token',
      {
        method: 'Post',
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.CLIENT,
          client_secret: process.env.SECRET,
          code: data.code,
          redirect_uri: 'http://localhost:3000',
        }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const json: AuthToken = await oauthResponse.json();
    const userId = await this.retrieveUserId(client, json);
    const uuid = randomUUID();
    this.storeSession(client, userId, uuid);
  }

  private async retrieveUserId(
    client: Socket,
    authToken: AuthToken,
  ): Promise<number> {
    console.log(authToken.access_token);
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      method: 'Get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken.access_token,
      },
    });
    const json = await response.json();
    console.log(json.id);
    this.sockets.storeSocket(json.id, client);
    return json.id;
  }

  private storeSession(client: Socket, userId: number, uuid: string) {
    Queries.getInstance()
      .storeAuth(userId, uuid)
      .then(async (success) => {
        if (success) {
          await this.updateAuth(userId);
          client.emit('user_id', {
            user_id: userId,
            auth_cookie: uuid,
          });
        } else {
          client.emit('auth_failed', {
            msg: 'Unable to store auth token',
          });
        }
      });
  }
}

interface AuthData {
  code: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

interface dto {
  userID: number;
  access_token: string;
  receivingUsers: number[];
  pattern: string;
  payload: {};
}
