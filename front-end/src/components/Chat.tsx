import React, {  useContext } from "react";
import { SocketContext } from './Socket';
import './Components.css';
import { useNavigate } from 'react-router-dom';


const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
	const navigate = useNavigate()
		
    const handleClick = (e: React.FormEvent) => {
		e.preventDefault()
		console.log("click 1");
		socket.emit("channel_create", {
			creatoer_id: 1,
			channel_name: "test",
			creator2_id: 2,
		});
		navigate('/profile');
        //socket.emit("msgToServer", "test");
    };

	const createChat = () => {

	};

    return (
        <div className="app__text">
			<button className="loginform__button" onClick={(e) => handleClick(e)}>CHAT</button>
        </div>
    )
	//<button className="loginform__buton" onClick={() => navigate('/profile')}>CHAT</button>
	//<button className="loginform__button" onClick={(e) => handleClick(e)}>CHAT</button>
};

export default Chat;