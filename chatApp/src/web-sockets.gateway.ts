import {
  MessageBody,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Logger} from "@nestjs/common";
import {inflate} from "zlib";
import {Message} from "./Objects/Message";
import {Queries} from "./Database/Queries";

@WebSocketGateway(8080)
export class WebSocketsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() private server: any;
  private static instance: WebSocketsGateway;

  @SubscribeMessage('channels')
  handleChannelRequest(@MessageBody('user_id') id: number): string {
    return 'Hello world!';
  }

  @SubscribeMessage('message')
  getMessage(@MessageBody('sender_id') senderId: number,
             @MessageBody('channel_id') channelId: number,
             @MessageBody('timestamp') timestamp: number,
             @MessageBody('message') message: string) {
    Queries.getInstance().addChannelMessage(channelId,
        new Message(message, senderId, timestamp));
  }

  sendMessage(messageId: number) {
    this.server.emit('message', {
      messageId: messageId
    });
  }

  openChannel(channelId: number, userId: number) {
    this.server.emit('open_channel', {
      channelId: channelId,
      userId: userId
    })
  }

  afterInit() {
    WebSocketsGateway.instance = this;
    this.server.emit('message', { channelId: 'c' });
  }

  handleConnection(client: any) {
    Logger.log(client.string + " connected")
  }

  handleDisconnect(client) {
    Logger.log(client.string + " disconnected")
  }

  private static getServer(): any {
    return WebSocketsGateway.instance.server;
  }
}
