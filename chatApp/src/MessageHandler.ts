import {Client, ClientProxy, Transport} from "@nestjs/microservices";

export class MessageHandler {
    @Client({ transport: Transport.TCP })
    client: ClientProxy;

    async onApplicationBootstrap() {
        await this.client.connect();
    }

    sendMessage(userid: number, message: string) {
        this.client.emit('message', {
            user_id: userid,
            message: message
        });
    }
}