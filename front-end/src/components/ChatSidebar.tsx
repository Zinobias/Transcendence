import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannelInfo } from "../interfaces";
import { AiFillCloseSquare } from "react-icons/ai";
import ListUserChatrooms from "./ListUserChatrooms";

interface Props {
  channelId: number | undefined;
  setChannelId: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const ChatSidebar: React.FC<Props> = ({channelId, setChannelId}) => {

  const socket = useContext(SocketContext);
  const [cookies] = useCookies(['userID', 'user']);
  const [state, setState] = useState<boolean>(false);
  const [channels, setChannels] = useState<IChannelInfo[]>([]);
  
  // EVENT LISTENERS
  useEffect(() => {
    socket.on("get_channels_user", response  => {
      console.log(`socket.on get_channels_user`);
      console.log(response.channels[0]);
      setChannels([]);
      response.channels.forEach((element : IChannelInfo) => {
        setChannels( channels => [...channels, element])
        console.log(element.channelName);
      });
    });
    
    socket.on("channel_leave", response  => {
      if (response.success) {
        console.log("channel_leave success");
        if (channelId == response.channelId && cookies.userID == response.user_id)
          setChannelId(channelId => undefined);
        setState( state => !state);
      }
      else 
        alert(response.msg);
    });

    return () => {
      socket.off("channel_leave")
      socket.off("get_channels_user");
    }
  }, [])
  
  // EMIT TO UPDATE CHANNELS WHEN STATE CHANGES
  useEffect(() => {
    socket.emit("chat", {
      userId: cookies.userID,
      authToken: cookies.user,
      eventPattern: "get_channels_user",
      data: {user_id: cookies.userID}
    })
    console.log("emiting get_channels_user");
  },[state])

  const handleLeave = (e:  React.MouseEvent<HTMLSpanElement, MouseEvent>,  id: number) => {
      e.preventDefault();
      socket.emit("chat", {
        userId: cookies.userID,
        authToken: cookies.user,
        eventPattern: "channel_leave",
        data: {user_id: cookies.userID, channel_id: id}
      })
      console.log("emiting channel_leave");
  } 

  return (
    <div>
      MY CHATS
      {channels.map((element) => (
        // TO DO:
        // only show channels that are visible
        <li key={element.channelId} className="listChat">
            <span className="listChatUser__text" onClick={() => setChannelId(channelId => element.channelId)}>{element.channelName}</span> 
            {/* <span className="listChatUser__icon" onClick={(e) => handleLeave(e, element.channelId)}>
                <AiFillCloseSquare />
            </span> */}
        </li>
      ))}
    </div>
  )

}

export default ChatSidebar