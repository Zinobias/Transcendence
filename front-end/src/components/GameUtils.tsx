import React, { useContext } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";

export const DefaultMatchmaking: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    // emit to join default queue
    const handleJoin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.join.queue", 
            data: { userId: cookies.userID, gameMode: "DEFAULT" }
        });
        console.log(`socket.emit game.join.queue default`);
    };

    return (
        <div className="test">
            <img src="./SourceImages/default" className="gamePicture"/>
            <button className="newButton" onClick={(e) => handleJoin(e)}>default</button>
        </div>
    )

};

export const DiscoMatchmaking: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    // emit to join default queue
    const handleJoin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.join.queue", 
            data: { userId: cookies.userID, gameMode: "DISCOPONG" }
        });
        console.log(`socket.emit game.join.queue default`);
    };

    return (
        <div className="test">
            <img src="./SourceImages/discopong" className="gamePicture"/>
            <button className="gameDiscoButton" onClick={(e) => handleJoin(e)}>disco</button>
        </div>
    )
};

export const LeavetMatchmaking: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    // emit to leave queue
    const handleLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.leave.queue", 
            data: { userId: cookies.userID }
        });
        console.log(`socket.emit game.leave.queue`);
    };

    return (
        <>
            <button className="gameButton" onClick={(e) => handleLeave(e)}>leave queue</button>
        </>
    )

};


