import React, { useEffect, useContext, useState } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";

export const DefaultMatchmaking: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    // event listeners
    useEffect(() => {
        socket.on("game.join.queue", response => {
            if (response.success) 
                console.log(`socket.on game.join.queue success ${response?.msg}`);
        })

        return () => {
            socket.off("game.join.queue");
        }
    }, [])

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
        <>
            <button className="gameButton" onClick={(e) => handleJoin(e)}>default queue</button>
        </>
    )

};

export const LeavetMatchmaking: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    // event listeners
    useEffect(() => {
        socket.on("game.leave.queue", response => {
            if (response.success) 
                console.log(`socket.on ${response?.msg}`);
        })

        return () => {
            socket.off("game.leave.queue");
        }
    }, [])

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
            <button className="gameButton" onClick={(e) => handleLeave(e)}>leave</button>
        </>
    )

};

export const DiscoMatchmaking: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    // event listeners
    useEffect(() => {
        socket.on("game.join.queue", response => {
            if (response.success) 
                console.log(`socket.on game.join.queue success ${response?.msg}`);
        })

        return () => {
            socket.off("game.join.queue");
        }
    }, [])

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
        <>
            <button className="gameDiscoButton" onClick={(e) => handleJoin(e)}>disco queue</button>
        </>
    )
};

