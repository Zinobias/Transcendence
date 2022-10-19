import React, {  useContext, useState } from "react";
import { SocketContext } from './Socket';
import './Components.css';
import { useNavigate } from 'react-router-dom';


const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
	const navigate = useNavigate()
    const [chatroomName, setChatroomName] = useState<string>("");
		
    const handleClick = (e: React.FormEvent) => {
		e.preventDefault()
		console.log("click 1");
		socket.emit("channel_create", {
			creator_id: 1,
			channel_name: "test",
			creator2_id: 2,
		});
		navigate('chat_window');
        //socket.emit("msgToServer", "test");
    };

    return (
        <>
        <div className="chatrooms">
            Open Chatrooms
			{/* <button className="loginform__button" onClick={(e) => handleClick(e)}>NEW CHATROOM</button> */}
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
	//<button className="loginform__buton" onClick={() => navigate('/profile')}>CHAT</button>
	//<button className="loginform__button" onClick={(e) => handleClick(e)}>NEW CHATROOM</button>
    
};

export default Chat;
