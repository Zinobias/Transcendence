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

}

export interface microServiceDTO {
  eventPattern: string;
  userIDs: number[];
  data: object;
}
