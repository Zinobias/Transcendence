export interface IMessage {
    message: string;
    sender: number;
    timestamp: number;
}

export class Message {
    private readonly _message: string;
    private readonly _sender: number;
    private readonly _timestamp: number;

    constructor(message: string, sender: number, timestamp: number) {
        this._message = message;
        this._sender = sender;
        this._timestamp = timestamp;
    }

    get message(): string {
        return this._message;
    }

    get sender(): number {
        return this._sender;
    }

    get timestamp(): number {
        return this._timestamp;
    }

    public getIMessage(): IMessage {
        return {
            message: this._message,
            sender: this._sender,
            timestamp: this._timestamp
        }
    }
}
