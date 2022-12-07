import React, { useState, useRef, useEffect, useContext }  from "react";
import { useCookies } from "react-cookie";
import { IChannel, IMessage } from "../interfaces";
import ChatInput from "./ChatInput";
import { SocketContext } from "./Socket";
import { AiOutlineMenu } from "react-icons/ai";

interface Props {
    channel: IChannel | undefined;
}

const   ChatWindow: React.FC<Props> = ({channel}) => {
	
    const [chat, setChat] = useState<IMessage[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);

    useEffect(() => {
        if (channel != undefined)
            setChat([]);
    }, [channel]);

    // EVENT LISTENERS
    useEffect(() => {
        socket.on("channel_message", response => {
            if (response.success) {
                console.log(`socket.on channel_message success`);
                setChat(chat => [...chat, response.message]);
            }
            else 
                alert(response.msg);
        })

        socket.on("channel_leave", response  => {
            if (response.success) 
                setChat(chat => [...chat, {message: "has left the channel.", sender: response.user_id, timestamp: -1}])
        });

        socket.on("channel_join", response => {
            // if we are looking at the channel where a new user joins we want to update the channel
            if (response.success == true && response.channel_id == channel?.channelId) {
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "channel_retrieve_by_id", 
                    data: { user_id: cookies.userID, 
                            channel_id: channel?.channelId }
                });
            }
            if (response.success == true)
                setChat(chat => [...chat, {message: "has joined the channel.", sender: response.user_id, timestamp: -1}])
        })

        socket.on("channel_promote", response => {
            if (response.success == true) 
                setChat(chat => [...chat, {message: "got promoted!", sender: response.affected_id, timestamp: -1}])
            else
                console.log("socket.on channel_promote fail");
        })

        socket.on("channel_demote", response => {
            if (response.success == true) 
                setChat(chat => [...chat, {message: "got demoted!", sender: response.affected_id, timestamp: -1}])
            else
                console.log("socket.on channel_demote fail");
        })

        return () => {
            socket.off("channel_message");
            socket.off("channel_retrieve_by_id");
            socket.off("channel_leave");
            socket.off("channel_join");
            socket.off("channel_promote");
            socket.off("channel_demote");
        }
    }, [])

    // SET INPUT REF
    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    // MAKE CHAT SCROOL TO BOTTOM
    useEffect(() => {
        if(inputRef&& inputRef.current) {
          const element = inputRef.current;
          element.scroll({
            top: element.scrollHeight,
            left: 0,
            // behavior: "smooth"
          })
        }
    }, [inputRef, chat, channel])

    function returnName (id: number) : string {
        const ret = channel?.users.find((e) => e.userId == id)?.name
        return (ret == undefined ? "Unknown User": ret);
    }

    function returnDate (timestamp : number) : string {
        const date = new Date(Number(timestamp));
        return(`${date.getHours() < 9 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 9 ? '0' + date.getMinutes() : date.getMinutes()}`);
    }

    const toggleSettings = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("chatSettings")?.classList.toggle("footerChat__show");
    };

    if (channel == undefined) {
        return (
            <div className="chatroom">
                No Chatroom loaded
            </div>
        )
    }
    
    return (
        <>

        <div className="chatroom">
            {channel?.channelName}
            <span className="chatroom__settingsicon" onClick={(e) => toggleSettings(e)}>
                <AiOutlineMenu />
            </span>
            
            <div className="chatroom__text" ref={inputRef}>
                {
                    channel?.messages.map((element, index) => (
                        <div key={index} className="chatroom__text--bubble">
                            <p className="chatp"><b>{returnName(element.sender)} {returnDate(element.timestamp)}</b><br/>{element.message}</p>
                        </div>
                    ))
                }
                {
                    chat.map((element, index) => (
                        <div key={index} className="chatroom__text--bubble">
                            {
                                element.timestamp == -1 ?
                                <p className="chatp">{returnName(element.sender)} {element.message}</p> :
                                <p className="chatp"><b>{returnName(element.sender)} {returnDate(element.timestamp)}</b><br/>{element.message}</p>
                            }
                        </div>
                    ))
                }
            </div>
            <ChatInput channelId={channel.channelId}/>
        </div>
        </>
    )
};

export default ChatWindow;