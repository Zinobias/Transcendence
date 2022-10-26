export interface AuthData {
  code: string;
}

export interface ReceiveMessage {
  channelId: number;
  userId: number;
  message: string;
}
