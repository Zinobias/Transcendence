export interface ChannelError {
    reason: string
}

export interface ChannelCreate {
    user_id: number;
    channel_name: string;
    creator2_id: number;
    visible: boolean;
    should_get_password: boolean;
}

export interface ChannelUpdatePassword {
    user_id: number
    channel_id: number
    password: string //Password should already be hashed here
}

export interface ChannelJoin {
    user_id: number;
    channel_id: number;
}

export interface ChannelLeave {
    user_id: number;
    channel_id: number;
}

export interface ChannelPromote {
    user_id: number;
    channel_id: number;
    affected_id: number;
}

export interface ChannelDemote {
    user_id: number;
    channel_id: number;
    affected_id: number;
}

export interface ChannelKick {
    user_id: number;
    channel_id: number;
    affected_id: number;
}

export interface ChannelBan {
    user_id: number;
    channel_id: number;
    affected_id: number;
    until: number;
}

export interface ChannelDisband {
    user_id: number;
    channel_id: number;
}

export interface ChannelMessage {
    user_id: number;
    channel_id: number;
    message: string;
}

export interface ChannelsRetrieve {
    user_id: number
}
