import React, { useState, useRef, useEffect, useContext }  from "react";
import { useCookies } from "react-cookie";
import { IChannel, IMessage } from "../interfaces";
import ChatInput from "./ChatInput";
import { SocketContext } from "./Socket";

interface Props {
    channelId: number | undefined;
}

const   ChatWindow: React.FC<Props> = ({channelId}) => {
	
    const [chat, setChat] = useState<IMessage[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [channel, setChannel] = useState<IChannel>();
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);

    // IF CHANNEL IF CHANGES EMIT TO GET NEW CHANNEL
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
            if (response.success) {
                console.log(`socket.on channel_message success`);
                setChat(chat => [...chat, response.message]);
            }
            else {
                console.log(`socket.on channel_message fail ${response.msg}`);
                //setChat(chat => [...chat, response.msg]);
            }
        })

        socket.on("channel_retrieve_by_id", response => {
            console.log(`socket.on channel_retrieve_by_id ${response.channel.channelName}`)
            setChannel(channel => response.channel);
        })

        return () => {
            socket.off("channel_message");
            socket.off("channel_retrieve_by_id");
        }
    }, [])

    // SET INPUT REF
    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    // IF CHAT OR REF CHANGES SCROOL
    useEffect(() => {
        if(inputRef&& inputRef.current) {
          const element = inputRef.current;
          element.scroll({
            top: element.scrollHeight,
            left: 0,
            behavior: "smooth"
          })
        }
    }, [inputRef, chat, channel])

    function returnName (id: number) : string {
        const ret = channel?.users.find((e) => e.userId == id)?.name
        return (ret == undefined ? "Unknown User": ret);
    }

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
            <div className="chatroom__text" ref={inputRef}>
                {
                    channel?.messages.map((element, index) => (
                        <div key={index} className="chatroom__text--bubble">
                            <p className="chatp"><b>{returnName(element.sender)} {element.timestamp}</b><br/>{element.message}</p>
                        </div>
                    ))
                }
                {
                    chat.map((element, index) => (
                        <div key={index} className="chatroom__text--bubble">
                        <p className="chatp"><b>{returnName(element.sender)} {element.timestamp}</b><br/>{element.message}</p>
                    </div>
                ))}
            </div>
            <ChatInput channelId={channelId}/>
        </div>
    )
};

export default ChatWindow;