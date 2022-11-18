import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class Sockets {
  private socketMap : Map<number, Socket>;

  constructor() {
	this.socketMap = new Map<number, Socket>();
  }

  public storeSocket(userId: number, socket: Socket) {
    console.log(`storing socket : ${userId} and ${socket}`);
    this.socketMap.set(userId, socket);
  }

  public getSocket(userId: number): Socket | undefined {
    return this.socketMap.get(userId);
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
