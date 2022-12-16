import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannel, IChannelInfo } from "../interfaces";
import { AiFillCloseSquare } from "react-icons/ai";
import ListUserChatrooms from "./ListUserChatrooms";

interface Props {
    channelId: number | undefined;
    setChannelId: React.Dispatch<React.SetStateAction<number | undefined>>;
    channel: IChannel | undefined;
    setChannel: React.Dispatch<React.SetStateAction<IChannel | undefined>>;
}

const ChatSidebar: React.FC<Props> = ({channelId, setChannelId, channel, setChannel}) => {

    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [state, setState] = useState<boolean>(false);
    const [channels, setChannels] = useState<IChannelInfo[]>([]);

    // when the state changes we want to update the channels in the sidebar
    useEffect(() => {
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_channels_user",
            data: {user_id: cookies.userID}
        })
        console.log("emiting get_channels_user");
    }, [state])


    // EVENT LISTENERS
    useEffect(() => {
        socket.on("get_channels_user", response  => {
            console.log(`socket.on get_channels_user success`);
            setChannels([]);
            response.channels.forEach((element : IChannelInfo) => {
                setChannels(channels => [...channels, element])
                console.log(`${element.channelName} ${element.channelId}`);
            });
        });

        socket.on("channel_join", response => {
            // if current user joined a channel update side channels
            if (response.success && response.user_id == cookies.userID) {
                console.log("socket.on channel join success");
                setState(state => !state);
            }
            else if (response.success === false)
                alert(response.msg);
        })

        socket.on("channel_leave", response  => {
            // if current user left the channel update sidechannels
            if (response.success && cookies.userID == response.user_id)
                setState(state => !state);
            // if current user left and was looking at the channel set channel to undefined
            if (response.success && channelId == response.channel_id && cookies.userID == response.user_id)
                setChannel(channel => undefined);
        });

        socket.on("channel_ban", response  => {
            // if current user got banned update sidechannels
            if (response.success && cookies.userID == response.affected_id)
                setState(state => !state);
            // if current user got banned and was looking at the channel set channel to undefined
            if (response.success && channelId == response.channel_id && cookies.userID == response.affected_id)
                setChannel(channel => undefined);
        });

        return () => {
            socket.off("get_channels_user");
            socket.off("channel_join");
            socket.off("channel_leave");
            socket.off("channel_ban");
        }
    }, [channelId])
  
  /*
    TODO:
    only show channels that are visible
  */

    return (
    <div>
        <p style={{textAlign: "center", lineHeight: "0"}}>MY CHATS:</p>
        {channels.map((element) => (
        <li key={element.channelId} className="listChat">
            <span className="listChatUser__text" onClick={() => setChannelId(channelId => element.channelId)}>{element.channelName}</span> 
        </li>
        ))}
    </div>
    )

}

export default ChatSidebar