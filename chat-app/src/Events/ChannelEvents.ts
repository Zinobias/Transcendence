export interface ChannelCreate {
  creator_id: number;
  channel_name: string;
  creator2_id: number;
}

export interface ChannelJoin {
  channel_id: number;
  user_id: number;
}

export interface ChannelLeave {
  channel_id: number;
  user_id: number;
}

export interface ChannelPromote {
  channel_id: number;
  user_id: number;
  actor_id: number;
}

export interface ChannelDemote {
  channel_id: number;
  user_id: number;
  actor_id: number;
}

export interface ChannelKick {
  channel_id: number;
  user_id: number;
  actor_id: number;
}

export interface ChannelBan {
  channel_id: number;
  user_id: number;
  actor_id: number;
  until: number;
}

export interface ChannelDisband {
  channel_id: number;
}
