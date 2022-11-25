import React, { useEffect, useState, useRef, useContext } from 'react'
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";

interface Props {
    channelId: number | undefined;
}

const ChatInput: React.FC<Props> = ({channelId}) => {

    const [message, setMessage] = useState<string>("");
    const [chat, setChat] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);

    // EVENT LISTENERS

    const emitMessage = (e: React.FormEvent) => {
        e.preventDefault();

        setChat([...chat, message]);
        setMessage("");
        
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_message", 
            data: { user_id: cookies.userID, 
                    channel_id: channelId,
                    message: message }
        });
        console.log(`emiting channel_message message:[${message}]`);

    }

    return (
        <>
            <form className="chatroom__form"  onSubmit={(e) => {
                emitMessage(e)
                // inputRef.current?.blur();
            }}>
                <input 
                    className="chatroom__form--input" 
                    ref={inputRef}
                    type="input"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}  
                    // placeholder="Enter your message"
                />
            </form>
        </>
    )
}

export default ChatInput