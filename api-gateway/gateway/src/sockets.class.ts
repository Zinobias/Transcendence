import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class Sockets {
  private static socketMap : Map<number, Socket>= new Map<number, Socket>();

  public storeSocket(userId: number, socket: Socket) {
    Sockets.socketMap.set(userId, socket);
  }

  public getSocket(userId: number): Socket | undefined {
    if (Sockets.socketMap.has(userId)) {
      return Sockets.socketMap.get(userId);
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
