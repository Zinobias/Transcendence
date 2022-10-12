export class UserCreate {
  user_id: number;
  login_id: string;
  name: string;
}

export class UserEditName {
  user_id: number;
  new_name: string;
}

export class UserEditAvatar {
  user_id: number;
  new_avatar: string;
}

export class UserBlockUser {
  user_id: number;
  blocked_id: number;
}

export class UserUnblockUser {
  user_id: number;
  blocked_id: number;
}

export class UserFriendUser {
  user_id: number;
  friend_id: number;
}

export class UserAcceptFriendUser {
  user_id: number;
  friend_id: number;
}

export class UserRemoveFriend {
  user_id: number;
  friend_id: number;
}
