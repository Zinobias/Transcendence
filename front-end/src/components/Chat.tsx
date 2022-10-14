import React, { useEffect, useContext } from "react";
import { SocketContext } from './Socket';
import './Components.css';

const   Chat: React.FC = () => {

    const socket = useContext(SocketContext);
    
    const handleClick = () => {
        console.log("test");
        socket.emit("msgToServer", "test");
    };

    return (
        <div className="app__text">
            <button className="loginform__button" onClick={() => handleClick()}>CHAT</button>
        </div>
    )
};

export default Chat;