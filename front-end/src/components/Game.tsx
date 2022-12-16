import React, { useEffect, useContext, useState } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";
import { DefaultMatchmaking, DiscoMatchmaking, LeavetMatchmaking } from "./GameUtils";
import GameCanvas from "./GameCanvas";
import GameTestCanvas from "./GameTestCanvas";
import { IGameInfo } from "../DTOs/frontend.DTOs.game.matchmaking";


/*
    GAME TODO

    call isInGame on mount to see if a player is still in a game and reconnect the player.
    eventPattern : 'game.frame.update.' + gameInfo.gameId 
*/

const   Game: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [gameInfo, setGameinfo] = useState<IGameInfo>();

    // game event listeners
    useEffect(() => {

        // on mount emit to see if user is in a game
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.isInGame", 
            data: { userId: cookies.userID }
        });

        // we found a game so we ask for the activeGameId
        socket.on("game.found", response => {
            socket.emit("game", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "game.get.activeGameId", 
                data: { userId: cookies.userID }
            });
            console.log(`socket.emit game.get.activeGameId`);
        })

        // user is in a game so we ask for activeGameId
        socket.on("game.isInGame", response => {
            if (response.success) {
                socket.emit("game", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "game.get.activeGameId", 
                    data: { userId: cookies.userID }
                });
                console.log(`socket.emit game.get.activeGameId`);
            }
        })

        // returns the ID for the game the user is currently in
        socket.on("game.get.activeGameId", response => {
            console.log(`socket.on game.get.activeGameId ${response.success} ${response.msg}`);
            if (response.success) {
                socket.emit("game", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "game.get.gameInfo", 
                    data: { userId: cookies.userID, gameId: response.gameId }
                });
            }
            // setActiveGameId(activeGameId => response.gameId);
        })

        socket.on("game.get.gameInfo", response => {
            if (response.gameInfo) 
                setGameinfo(gameInfo => response.gameInfo);
        })

        return () => {
            socket.off("game.found");
            socket.off("game.isInGame");
            socket.off("game.get.activeGameId");
            socket.off("game.get.gameInfo");

            // emit to leave queue when we leave the page
            // console.log(`socket.emit game.leave.queue default`);
            socket.emit("game", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "game.leave.queue", 
                data: { userId: cookies.userID }
            });
        }
    }, [])

    return (
        <>
            {/* <GameTestCanvas /> */}

            {
                gameInfo !== undefined ?
                <GameCanvas gameInfo={gameInfo} setGameinfo={setGameinfo}/> :
                <>                
                    <DefaultMatchmaking />
                    <DiscoMatchmaking />
                    <LeavetMatchmaking />
                </>
            }
        </>
    )
};

export default Game;