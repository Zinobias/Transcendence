import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannelInfo } from "../interfaces"
import ListUserChatrooms from "./ListUserChatrooms";

const ChatSidebar: React.FC = () => {

  const socket = useContext(SocketContext);
  const [cookies] = useCookies(['userID', 'user']);
  const [channels, setChannels] = useState<IChannelInfo[]>([]);
  
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
      ChatSidebar
      <ListUserChatrooms chatroom={channels} />
    </div>
  )

}

export default ChatSidebar