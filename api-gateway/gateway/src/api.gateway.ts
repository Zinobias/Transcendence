import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Queries } from './database/queries';
import { randomUUID } from 'crypto';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class ApiGateway {
  constructor(@Inject(Auth) private readonly auth: Auth) {}
  @SubscribeMessage()
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
  auth(client: Socket, data: AuthData) {
    fetch('https://api.intra.42.fr/v2/oauth/token', {
      method: 'Post',
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT,
        client_secret: process.env.SECRET,
        code: data.code,
        redirect_uri: 'http://localhost:3000',
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      response.json().then((result: AuthToken) => {
        console.log(result.access_token);
        fetch('https://api.intra.42.fr/v2/me', {
          method: 'Get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + result.access_token,
          },
        }).then((secondResponse) => {
          secondResponse.json().then((secondResult) => {
            console.log(secondResult.id);
            this.sockets.storeSocket(secondResult.id, client);
            const uuid = randomUUID();
            Queries.getInstance()
              .storeAuth(secondResult.id, uuid)
              .then(async (success) => {
                if (success) {
                  await this.updateAuth(secondResult.id);
                  client.emit('user_id', {
                    user_id: secondResult.id,
                    auth_cookie: uuid,
                  });
                } else {
                  client.emit('auth_failed', {
                    msg: 'Unable to store auth token',
                  });
                }
              });
          });
        });
      });
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
