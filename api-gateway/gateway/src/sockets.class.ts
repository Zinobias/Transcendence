import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class Sockets {
  private static socketMap = new Map();

  public storeSocket(userId: number, socket: Socket) {
    Sockets.socketMap.set(userId, socket);
  }

  public getSocket(userId: number): Socket | null {
    if (Sockets.socketMap.has(userId)) {
      return Sockets.socketMap.get(userId);
    }
    return null;
  }

  public sendData(users: number[], pattern: string, payload: {}) {
    for (const user of users) {
      const socket = this.getSocket(user);
      if (socket != null) {
        socket.emit(pattern, payload);
      }
    }
  }
}
