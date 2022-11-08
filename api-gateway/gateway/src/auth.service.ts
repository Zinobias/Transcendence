import { Inject, Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage } from '@nestjs/websockets';
import { Queries } from './database/queries';
import { randomUUID } from 'crypto';
import { Socket} from 'socket.io';
import { Sockets } from './sockets.class';
import { AuthData, AuthToken } from './auth.objects';

@Injectable()
export class Auth {
  constructor(@Inject(Sockets) private readonly sockets: Sockets,
  @Inject(Queries) private readonly queries : Queries) {}
  private static map = new Map();

  public checkAuth(userId: number, accessToken: string): boolean {
    if (Auth.map.has(userId)) {
      return Auth.map.get(userId) == accessToken;
    }
    return false;
  }

  public async updateAuth(userId: number) {
    const accessToken: string | null = await this.queries.loadSession(
      userId,
    );
    if (accessToken != null) {
      Auth.map.set(userId, accessToken);
    }
  }

  private logger = new Logger("auth");

  //@SubscribeMessage('auth')
  async auth(client: Socket, data: AuthData) {
    this.logger.log("auth event " + data.code);
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
    //this.logger.log("oauth response " + json);
    const userId = await this.retrieveUserId(client, json);
    const uuid = randomUUID();
    this.storeSession(client, userId, uuid);
  }

  private async retrieveUserId(
    client: Socket,
    authToken: AuthToken,
  ): Promise<number> {
    this.logger.log(authToken.access_token);
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      method: 'Get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken.access_token,
      },
    });
    const json = await response.json();
    this.logger.log(json.id);
    this.sockets.storeSocket(json.id, client);
    return json.id;
  }

  private storeSession(client: Socket, userId: number, uuid: string) {
    this.queries
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
