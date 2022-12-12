import {Injectable, Logger} from '@nestjs/common';
import { exit } from 'process';
import {Socket} from 'socket.io';
import { mapGetter } from './map.tools';

@Injectable()
export class Sockets {
    private socketMap: Map<number, Socket[]>;
    private logger = new Logger('Sockets');

    constructor() {
        this.logger.debug(`Creating new socketMap`);
        this.socketMap = new Map<number, Socket[]>();
    }

	private socketIsStored(userId : number, socket : Socket) : boolean{
		let socketMap : Socket[] = mapGetter(userId, this.socketMap);
		if (socketMap === undefined)
			return false;
		if (socketMap.find(e => e?.id == socket?.id) === undefined)
			return false;
		this.logger.debug(`uid : ${userId} SOCKET ALREADY STORED`)
		return true;
	}

    public storeSocket(userId: number, socket: Socket) {
		if (socket === undefined) {
			this.logger.error(`SOCKET UNDEFINED. fnc STORESOCKET`)
			return;
		}
		let socketArray : Socket[] = mapGetter(userId, this.socketMap);
		if (this.socketIsStored(userId, socket) === true)
			return ;
		if (socketArray === undefined)
			this.socketMap.set(userId, [socket]);
		else {
			socketArray.push(socket);
		}
    }

	/**
	 * 
	 * @param userId 
	 * @returns socketArray or undefined if none found.
	 */
    public getSocket(userId: number): Socket[] | undefined {
		let sockets : Socket[] | undefined = mapGetter(userId, this.socketMap);
        // this.logger.debug(`Retrieving socket for userId: [${userId}] found [${sockets![0] === undefined ? 'undefined' : sockets![0]}]`);
        return sockets ;
    }

	public removeSocket(socket : Socket) {
		for (let socketMap of this.socketMap.entries()) {
			let index = socketMap[1].findIndex((s) => {
				this.logger.warn(`REMOVE SOCKET SUCCESS : ${s?.id == socket.id}`);
				return (s?.id == socket.id);
			});
			if (index !== -1)
				socketMap[1].splice(index, 1);
		
		}
	}

	public removeAllSocketsUser(userId : number) {
		this.socketMap.delete(userId);
	}

    public sendData(users: number[], pattern: string, payload: object) {
        for (const user of users) {
            const sockets : Socket[] | undefined = this.getSocket(user);
            if (sockets !== undefined) {
				if (sockets!.length > 0) {
					sockets.forEach((e : Socket) => {
					// this.logger.debug(`Emitting to socket for userId: [${user}] eventPattern: ${pattern} socketId: ${e.id} socket length : ${sockets.length}`);
					e?.emit(pattern, payload);})
				}
            } else {
                this.logger.debug(`No socket for userId: [${user}] found when emitting to front end`);
            }
        }
    }
}
