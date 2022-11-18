import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { useNavigate} from 'react-router-dom';
import { TestRoom } from "../interfaces"
import ListChatrooms from "./ListChatrooms";
import './Components.css';

const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
	const navigate = useNavigate()
    const [cookies] = useCookies(['userID']);
    const [chatroomName, setChatroomName] = useState<string>("");

    useEffect(() => {
        socket.on("channel_create_success", data => {
            console.log(`socket.on channel_create_success ${data.channel_name}`);
        })

        socket.on("channels_for_user", data => {
            console.log(`socket.on channels_for_user`);
        })

        return () => {
            socket.off("channel_create_success");
            socket.off("channels_for_user");
        }
    },[])

    var chats: TestRoom[] = [
        {name: "chat 1", id: 1},
        {name: "chat 2", id: 2, password: true},
        {name: "chat 3", id: 3, password: true},
        {name: "chat 4", id: 4},
    ];

    const handleClick = (e: React.FormEvent) => {
		e.preventDefault()
        if (chatroomName) {
            socket.emit("chat", {
                eventPattern: "channel_create", 
                data: {creator_id: cookies.userID, channel_name: chatroomName, creator2_id: undefined}
            });
            console.log("emiting channel_create " + chatroomName);
            socket.emit("chat", {
                eventPattern: "get_channels_user",
                data: {user_id: cookies.userID}
            })
            console.log("emiting get_channels_user");
            // navigate('chat_window');
        }
        else {
            alert("Name Field is required");
        }
    };

    return (
        <>
        <div>
            <span className="heading__small">OPEN CHATROOMS PLACEHOLDER</span>
            <ListChatrooms chatroom={chats} />
        </div>
        <form className="loginform">
                <label className="loginform__label">Name</label>
                <input type="input" onChange={(e)=>setChatroomName(e.target.value)} placeholder="email" className="loginform__input"/>
                <label className="loginform__label">password (optional)</label>
                <input type="input" placeholder="password" className="loginform__input"/>
                <button className="loginform__button" onClick={(e) => handleClick(e)}>NEW CHATROOM</button>
        </form>
        </>
    )
    
};

export default Chat;
