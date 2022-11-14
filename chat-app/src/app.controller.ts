import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  private logger = new Logger('chat');
  constructor(
    private readonly appService: AppService,
    @Inject('gateway') private readonly gateway: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('testMsg')
  receiveInit(@Payload() payload: any) {
    this.gateway.emit('testMsg', 'msg from chat-app');
    this.logger.log('chat msg from gateway received');
  }
}

export interface microServiceDTO {
  eventPattern: string;
  userIDs: number[];
  payload: object;
}
