import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannelInfo } from "../interfaces"
import ListUserChatrooms from "./ListUserChatrooms";

interface Props {
  channelId: number | undefined;
  setChannelId: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const ChatSidebar: React.FC<Props> = ({channelId, setChannelId}) => {

  const socket = useContext(SocketContext);
  const [cookies] = useCookies(['userID', 'user']);
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
    
    return () => {
      socket.off("get_channels_user");
    }
  }, [])
  
  useEffect(() => {
    socket.emit("chat", {
      userId: cookies.userID,
      authToken: cookies.user,
      eventPattern: "get_channels_user",
      data: {user_id: cookies.userID}
    })
    console.log("emiting get_channels_user");
  },[])

  return (
    <div>
      MY CHATS
      {channels.map((element) => (
        // <p key={e.id}>{e.name}</p>
        <li key={element.channelId} className="listChat">
            <span className="listChat__text" onClick={(e) => setChannelId(channelId => element.channelId)}>{element.channelName}</span> 
        </li>
      ))}
    </div>
  )

}

export default ChatSidebar