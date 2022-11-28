import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AppGateway} from './app.gateway';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {ChannelEventPatterns} from './Listeners/ChannelEventPatterns';
import {Util} from './Listeners/Util';
import {RetrieveUserDataEventPatterns} from './Listeners/RetrieveUserDataEventPatterns';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'gateway',
                transport: Transport.TCP,
                options: {
                    host: 'gateway',
                    port: 8089,
                },
            },
        ]),
    ],
    controllers: [
        AppController,
        ChannelEventPatterns,
        RetrieveUserDataEventPatterns,
    ],
    providers: [AppService, AppGateway, Util],
})
export class AppModule {
}
