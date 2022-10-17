import React, { useEffect, useContext } from "react";
import { socket, SocketContext } from './Socket';
import './Components.css';
import { SocketAddress } from "net";


const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
		
    const handleClick = (e: React.FormEvent) => {
		e.preventDefault()
		console.log("click");
        socket.emit("msgToServer", "test");
    };

    return (
        <div className="app__text">
            <button className="loginform__button" onClick={(e) => handleClick(e)}>CHAT</button>
        </div>
    )
};

export default Chat;