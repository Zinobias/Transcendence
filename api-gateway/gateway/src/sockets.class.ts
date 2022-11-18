import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class Sockets {
  private socketMap : Map<number, Socket>;

  constructor() {
	this.socketMap = new Map<number, Socket>();
  }

  public storeSocket(userId: number, socket: Socket) {
    this.socketMap.set(userId, socket);
  }

  public getSocket(userId: number): Socket | undefined {
    if (this.socketMap.has(userId)) {
      return this.socketMap.get(userId);
    }
    return undefined;
  }

  public sendData(users: number[], pattern: string, payload: object) {
    for (const user of users) {
      const socket = this.getSocket(user);
      if (socket != null) {
        socket.emit(pattern, payload);
      }
    }
  }
}
