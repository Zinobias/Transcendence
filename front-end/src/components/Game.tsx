import React, { useEffect, useContext, useState } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from "./Socket";
import { DefaultMatchmaking, DiscoMatchmaking, LeavetMatchmaking } from "./GameUtils";
import GameCanvas from "./GameCanvas";


/*
    GAME TODO

    call isInGame on mount to see if a player is still in a game and reconnect the player.
    eventPattern : 'game.frame.update.' + gameInfo.gameId 
*/

const   Game: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [gameFound, setGameFound] = useState<boolean>(false);
    const [vs, setVs] = useState<string>("");
    const [activeGameId, setActiveGameId] = useState<number>();

    // game frame event listener
    // useEffect(() => {

    //     console.log(activeGameId);
    //     console.log(`game.frame.update.` + activeGameId);
        
    //     // if (activeGameId !== undefined) {
    //     //     console.log("listener set up");
    //     //     socket.on(`game.frame.update.` + activeGameId, response => {
    //     //         console.log("socket.on game.frame.update");
    //     //         console.log(response.payload[0]);
    //     //     })
    //     // }

    //     socket.on(`game.frame.update.` + activeGameId, response => {
    //         console.log("socket.on game.frame.update");
    //         console.log(response[0]);
    //     })

    //     return () => {
    //         socket.off(`game.frame.update.` + activeGameId);
    //     }
    // }, [activeGameId])


    // game event listeners
    useEffect(() => {
        socket.on("game.found", response => {
            // emit game.get.activeGameId
            // if we have our game id we can get our gameInfo Object
            setGameFound(gameFound => true);
            setVs(vs => (cookies.userID === response.playerIds[0] ? response.playerIds[1] : response.playerIds[0]));

            socket.emit("game", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "game.get.activeGameId", 
                data: { userId: cookies.userID }
            });
            console.log(`socket.emit game.get.activeGameId`);
        })

        socket.off("game.ended", response => {
            // change state to display winning prompt to be clicked away and then normal page again
            // chaange activeGameId
            console.log(`socket.on game.ended winner ${response.winner}`);
            setActiveGameId(activeGameId => undefined);
        })

        socket.on("game.isInGame", response => {
            // onMount if user is inGame display game again and ask for game Object
            console.log(`socket.on game.isInGame ${response.success} ${response.msg}`);
        })

        socket.on("game.get.activeGameId", response => {
            // returns the ID for the game the user is currently in
            console.log(`socket.on game.get.activeGameId ${response.success} ${response.msg}`);
            if (response.success)
                setActiveGameId(activeGameId => response.gameId);
        })

        socket.on("game.get.gameInfo", response => {
            console.log(`socket.on game.get.gameInfo`);
        })

        return () => {
            socket.off("game.found");
            socket.off("gmae.ended");
            socket.off("game.isInGame");
            socket.off("game.get.activeGameId");
            socket.off("game.get.gameInfo");

            // emit to leave queue when we leave the page
            socket.emit("game", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "game.leave.queue", 
                data: { userId: cookies.userID }
            });
            console.log(`socket.emit game.leave.queue default`);
        }
    }, [])

    const isInGame = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.isInGame", 
            data: { userId: cookies.userID }
        });
        console.log(`socket.emit game.isInGame`);
    };

    const getGameId = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.get.activeGameId", 
            data: { userId: cookies.userID }
        });
        console.log(`socket.emit game.get.activeGameId`);
    };

    return (
        <>
            {/* <canvas className="gameCanvas" id="gameCanvas" width={512*2} height={256*2} />
            <button className="gameButton" onClick={(e) => draw(e)}>draw</button> */}
            {
                activeGameId !== undefined &&
                <GameCanvas gameId={activeGameId}/>
            }
            {/* {
                gameFound &&
                <>
                    <p>Game Found!</p>
                    <p>{cookies.userID} vs {vs}</p>
                </>
            } */}
            <DefaultMatchmaking />
            <LeavetMatchmaking />
            <button className="gameButton" onClick={(e) => isInGame(e)}>is in game</button>
            <button className="gameButton" onClick={(e) => getGameId(e)}>game id</button>

            {/* <DiscoMatchmaking /> */}
        </>
    )
};

export default Game;