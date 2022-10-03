export class ChannelCreate {
    creator_id: number
    channel_name: string
    creator2_id: number
}

export class ChannelJoin {
    channel_id: number
    user_id: number
}

export class ChannelLeave {
    channel_id: number
    user_id: number
}

export class ChannelPromote {
    channel_id: number
    user_id: number
    actor_id: number
}

export class ChannelDemote {
    channel_id: number
    user_id: number
    actor_id: number
}

export class ChannelKick {
    channel_id: number
    user_id: number
    actor_id: number
}

export class ChannelBan {
    channel_id: number
    user_id: number
    actor_id: number
    until: number
}

export class ChannelDisband {
    channel_id: number
}