import React, { useState, useRef, useEffect, useContext }  from "react";
import { useCookies } from "react-cookie";
import { IChannel } from "../interfaces";
import ChatInput from "./ChatInput";
import { SocketContext } from "./Socket";

interface Props {
    channelId: number | undefined;
}

const   ChatWindow: React.FC<Props> = ({channelId}) => {
	
    const [chat, setChat] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [channel, setChannel] = useState<IChannel>();
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);

    useEffect(() => {
        if (channelId != undefined) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_retrieve_by_id", 
                data: { user_id: cookies.userID, 
                        channel_id: channelId }
            });
            console.log(`socket.emit channel_retrieve_by_id ${channelId}`);
        }
        setChat([]);
    }, [channelId])


    // EVENT LISTENERS
    useEffect(() => {
        socket.on("channel_message", response => {
            //console.log(`socket.on channel_message`);
            if (response.success) {
                console.log(`socket.on channel_message ${response.message.message}`);
                // setChat([...chat, response.message.message]);
                setChat(chat => [...chat, response.message.message]);
            }
            else {
                console.log(`socket.on channel_message ${response.msg}`);
                //setChat(chat => [...chat, response.msg]);
            }
        })

        socket.on("channel_retrieve_by_id", response => {
            console.log(`channel_retrieve_by_id ${response.channel.channelName}`)
            setChannel(channel => response.channel);
        })

        return () => {
            socket.off("channel_message");
            socket.off("channel_retrieve_by_id");
        }
    }, [])

    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    useEffect(() => {

        if(inputRef&& inputRef.current) {
          const element = inputRef.current;
          element.scroll({
            top: element.scrollHeight,
            left: 0,
            behavior: "smooth"
          })
        }
  
    }, [inputRef, chat])

    if (channelId == undefined) {
        return (
            <div className="chatroom">
                No Chatroom loaded
            </div>
        )
    }
    return (
        <div className="chatroom">
            {channel?.channelName}
            <ChatInput channelId={channelId}/>
            <div className="chatroom__text" ref={inputRef}>
                {chat.map((element, index) => {
                return (
                <div key={index} className="chatroom__text--bubble">
                    <p className="chatp"><b>USER</b><br/>{element}</p>
                </div>
                );
                })}
            </div>
        </div>
    )
};

export default ChatWindow;