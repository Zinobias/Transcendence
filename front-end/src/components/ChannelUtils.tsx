import React, { useContext } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { IChannel, SettingType } from '../interfaces'
import { SocketContext } from './Socket';

interface Props {
    channel: IChannel;
    memberUserID: number;
}

/*
    TO DO:
    SETTINGS DM:
    - Profile
    - Invite to game

    SETTINGS CHATROOM:
    - Leave channel button
    - if owner:
        show password stuff on top
    - member list:
        - Member Settings:
        - Go to Profile
        - Invite to Game
        - if Admin/Owner:
            MakeAdmin/Mute/Ban
*/

const ChannelUtils: React.FC<Props> = ({channel, memberUserID}) => {
    const [cookies] = useCookies(['userID', 'user']);
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    const handleProfile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>,  userId: number) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + userId,
        })
    }

    const handleDemote = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_demote",
            data: {user_id: cookies.userID, channel_id:channel.channelId, affected_id: memberUserID}
        })
        console.log("emitting channel_demote");
    }

    const handlePromote = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_promote",
            data: {user_id: cookies.userID, channel_id: channel.channelId, affected_id: memberUserID}
        })
        console.log(`emitting channel_promote ${channel.channelId} ${memberUserID}`);
    }

    function findAdmin (userId : number) : boolean {
        if (userId == channel.owner)
            return (true);
        const res = channel?.settings.find((e) => userId == e.userId && e.setting == SettingType.ADMIN);
        return (res !== undefined);
    }
	
    if (cookies.userID == memberUserID) {
        return (
            <>
                <button className="memberButton" onClick={(e) => handleProfile(e, memberUserID)}>profile</button>
            </>
        )
    }

    else if (channel.otherOwner != undefined || findAdmin(cookies.userID) == false) {
        return (
            <>
                <button className="memberButton" onClick={(e) => handleProfile(e, memberUserID)}>profile</button>
                <button className="memberButton">invite to pong</button>
            </>
        )
    }

    return (
        <>
            <button className="memberButton" onClick={(e) => handleProfile(e, memberUserID)}>profile</button>
            <button className="memberButton">invite to pong</button>
            {
                memberUserID != channel.owner && findAdmin(memberUserID) == false ?
                <button className="memberButton" onClick={(e) => handlePromote(e)}>promote</button> :
                <button className="memberButton" onClick={(e) => handleDemote(e)}>demote</button>
            }
            <button className="memberButton">ban</button>
            <button className="memberButton">mute</button>

        </>
    )
}

export default ChannelUtils;