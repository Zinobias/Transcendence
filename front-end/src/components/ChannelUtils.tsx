import React, { useContext } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { IChannel, SettingType } from '../interfaces'
import { SocketContext } from './Socket';

interface Props {
    channel: IChannel;
    memberUserID: number;
}

const ChannelUtils: React.FC<Props> = ({channel, memberUserID}) => {
    const [cookies] = useCookies(['userID', 'user']);
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    function returnDate () : number {
        const date = new Date();
        const newDate = new Date(date.getTime() + 30 * 60 * 1000);
        return(newDate.getTime());
    }

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

    const handleMute = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_mute_user",
            data: {user_id: cookies.userID, channel_id: channel.channelId, affected_id: memberUserID, until: returnDate()}
        })
        console.log(`emitting channel_mute_user`);
    }

    const handleBan = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_ban",
            data: {user_id: cookies.userID, channel_id: channel.channelId, affected_id: memberUserID, until: returnDate()}
        })
        console.log(`emitting channel_ban`);
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
                <button className="memberButton">block</button>
            </>
        )
    }

    return (
        <>
            <button className="memberButton" onClick={(e) => handleProfile(e, memberUserID)}>profile</button>
            <button className="memberButton">invite to pong</button>
            <button className="memberButton">block</button>
            {
                memberUserID != channel.owner &&
                <>
                {
                    findAdmin(memberUserID) == false ?
                    <button className="memberButton" onClick={(e) => handlePromote(e)}>promote</button> :
                    <button className="memberButton" onClick={(e) => handleDemote(e)}>demote</button>
                }
                <button className="memberButton" onClick={(e) => handleMute(e)}>mute</button>
                <button className="memberButton" onClick={(e) => handleBan(e)}>ban</button>
                </> 
            }

        </>
    )
}

export default ChannelUtils;