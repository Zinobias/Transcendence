import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketsGateway } from './web-sockets.gateway';

describe('WebSocketsGateway', () => {
  let gateway: WebSocketsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSocketsGateway],
    }).compile();

    gateway = module.get<WebSocketsGateway>(WebSocketsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
