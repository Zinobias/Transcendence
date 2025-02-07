import React, { useContext } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { IChannel, SettingType } from '../interfaces'
import { SocketContext } from './Socket';

interface Props {
    channel: IChannel;
    memberUserID: number;
}

const ChannelSettingsUtils: React.FC<Props> = ({channel, memberUserID}) => {
    const [cookies] = useCookies(['userID', 'user']);
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    function returnDate () : number {
        const date = new Date();
        const newDate = new Date(date.getTime() + 30 * 60 * 1000);
        return(newDate.getTime());
    }

    const handleProfile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + memberUserID,
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

    const gameInvite = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, gameMode : string) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "invite_game_user",
            data: {user_id: cookies.userID, request_user_id: memberUserID, game_mode: gameMode}
        })
        console.log(`emitting invite_game_user`);
    }

    function isAdmin (userId : number) : boolean {
        if (userId == channel.owner)
            return (true);
        const res = channel.settings.find((e) => userId == e.userId && e.setting == SettingType.ADMIN);
        // if res is not undefined return true else false
        return (res !== undefined);
    }

    function isMuted(userId: number) : boolean {
        const res = channel.settings.find((e) => userId == e.userId && e.setting == SettingType.MUTED);
        // if res is not undefined return true else false
        return (res !== undefined);
    }
	
    if (cookies.userID == memberUserID) {
        return (
            <>
                <button className="memberButton" onClick={(e) => handleProfile(e)}>profile</button>
            </>
        )
    }

    else if (channel.otherOwner != undefined || isAdmin(cookies.userID) == false) {
        return (
            <>
                <button className="memberButton" onClick={(e) => handleProfile(e)}>profile</button>
                <span style={{display: "inline", textAlign: "center", fontWeight: "bold", fontSize: "90%"}}>INVITE TO PONG</span>
                <button style={{border: "none"}} className="memberButton" onClick={(e) => gameInvite(e, "DEFAULT")}>default</button>
                <button className="memberButton" onClick={(e) => gameInvite(e, "DISCOPONG")}>disco</button>
            </>
        )
    }

    return (
        <>
            <button className="memberButton" onClick={(e) => handleProfile(e)}>profile</button>
            <span style={{display: "inline", textAlign: "center", fontWeight: "bold", fontSize: "90%"}}>INVITE TO PONG</span>
            <button style={{border: "none"}} className="memberButton" onClick={(e) => gameInvite(e, "DEFAULT")}>default</button>
            <button className="memberButton" onClick={(e) => gameInvite(e, "DISCOPONG")}>disco</button>
            {
                memberUserID != channel.owner &&
                <>
                {
                    isAdmin(memberUserID) == false ?
                    <button className="memberButton" onClick={(e) => handlePromote(e)}>promote</button> :
                    <button className="memberButton" onClick={(e) => handleDemote(e)}>demote</button>
                }
                {
                    isMuted(memberUserID) == false &&
                    <button className="memberButton" onClick={(e) => handleMute(e)}>mute</button>
                }
                    <button className="memberButton" onClick={(e) => handleBan(e)}>ban</button>
                </> 
            }

        </>
    )
}

export default ChannelSettingsUtils;