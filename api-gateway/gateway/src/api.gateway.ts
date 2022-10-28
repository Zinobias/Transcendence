import { Inject, Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { appendFile } from 'fs';
import { send } from 'process';

@WebSocketGateway()
export class ApiGateway {

  constructor(@Inject(random) private readonly random : random) {};
  @SubscribeMessage()
  handleMessage(client: any, payload: any): string {
    //client = chat-appendFile
    //client.send(pattern, payload);
    this.random.bla;
    return 'Hello world!';
  }
}

@Injectable()
export class random {
  public bla : number;
}

interface dto {
  userID : number,
  access_token : string,
  pattern : string,
  payload : {},
}
