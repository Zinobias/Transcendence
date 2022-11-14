export interface UserCreate {
  user_id: number;
  login_id: string;
  name: string;
}

export interface UserEditName {
  user_id: number;
  new_name: string;
}

export interface UserEditAvatar {
  user_id: number;
  new_avatar: string;
}

export interface UserBlockUser {
  user_id: number;
  blocked_id: number;
}

export interface UserUnblockUser {
  user_id: number;
  blocked_id: number;
}

export interface UserFriendUser {
  user_id: number;
  friend_id: number;
}

export interface UserAcceptFriendUser {
  user_id: number;
  friend_id: number;
}

export interface UserRemoveFriend {
  user_id: number;
  friend_id: number;
}

export interface GetUserData {
  user_id: number;
}
