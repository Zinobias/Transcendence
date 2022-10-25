import React, {  useContext, useState } from "react";
import { SocketContext } from './Socket';
import './Components.css';
import { useNavigate} from 'react-router-dom';

const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
	const navigate = useNavigate()
    const [chatroomName, setChatroomName] = useState<string>("");
		
    const handleClick = (e: React.FormEvent) => {
		e.preventDefault()
		socket.emit("channel_create", {
			creatoer_id: 1,
			channel_name: "test",
			creator2_id: 2,
		});
        socket.emit("msgToServer", "test");
		navigate('chat_window');
    };

    return (
        <>
        <div className="chatroom">
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
