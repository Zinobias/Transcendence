export interface Todo {
    id: number;
    todo: string;
}

export interface DTO {
    userID : number,
    accessToken : string,
    eventPattern : string,
    payload : {},
}
export interface TestRoom {
    name: string;
    id: number;
    password?: boolean;
}

// export interface Channel {
//     channelId: number,
//     owner: number,
//     channelName: string,
//     users: User[],
//     messages: Message[],
//     settings: Setting[],
//     closed: boolean,
//     otherOwner?: number,
// }