import {Injectable, Logger} from '@nestjs/common';
import {Socket} from 'socket.io';

@Injectable()
export class Sockets {
    private socketMap: Map<number, Socket>;
    private logger = new Logger('Sockets');

    constructor() {
        this.logger.debug(`Creating new socketMap`);
        this.socketMap = new Map<number, Socket>();
    }

    public storeSocket(userId: number, socket: Socket) {
        this.logger.debug(`Storing socket with userId: [${userId}] and socket id ${socket.id}`);
        this.socketMap.set(userId, socket);
    }

    public getSocket(userId: number): Socket | undefined {
        const socket: Socket | undefined = this.socketMap.get(userId);
        this.logger.debug(`Retrieving socket for userId: [${userId}] found [${socket === undefined ? 'undefined' : socket.id}]`);
        return socket;
    }

    public sendData(users: number[], pattern: string, payload: object) {
        for (const user of users) {
            const socket = this.getSocket(user);
            if (socket != null) {
                socket.emit(pattern, payload);
                this.logger.debug(`Emitting to socket for userId: [${user}] socketId: ${socket.id}`);
            } else {
                this.logger.debug(`No socket for userId: [${user}] found when emitting to front end`);
            }
        }
    }
}
