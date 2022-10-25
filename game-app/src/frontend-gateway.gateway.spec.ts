import { Test, TestingModule } from '@nestjs/testing';
import { FrontendGatewayGateway } from './frontend-gateway.gateway';

describe('FrontendGatewayGateway', () => {
  let gateway: FrontendGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrontendGatewayGateway],
    }).compile();

    gateway = module.get<FrontendGatewayGateway>(FrontendGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
