import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannel } from "../interfaces"
import ListUserChatrooms from "./ListUserChatrooms";

const ChatSidebar: React.FC = () => {

  const socket = useContext(SocketContext);
  const [cookies] = useCookies(['userID', 'user']);
  const [channels, setChannels] = useState<IChannel[]>([]);
  
  useEffect(() => {
    socket.on("channels_for_user", response  => {
      console.log(`socket.on channels_for_user`);
      setChannels([]);
      response.channels.forEach((element : IChannel) => {
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