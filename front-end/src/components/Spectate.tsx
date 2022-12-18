import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import './Components.css';
import { IGameInfo } from "../DTOs/frontend.DTOs.game.matchmaking";
import { SocketAddress } from "net";
import SpectateCanvas from "./SpectateCanas";

interface INames {
    userId : number;
    name : string;
}

const Spectate : React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    // const [games, setGames] = useState<IGameInfo[]>([{players : {player1 : 123, player2: 456}, gameId: 1, playerScores : {player1Score: 1, player2Score: 1}, gameMode: "test"}]);
    const [games, setGames] = useState<IGameInfo[]>([]);
    const [names, setNames] = useState<INames[]>([]);
    const [gameInfo, setGameinfo] = useState<IGameInfo>();

    // get active games
    useEffect(() => {
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.get.gameList",
            data: {userId: cookies.userID}
        })
        console.log("emiting game.get.gameList");

        socket.on("game.get.gameList", response => {
            if (response.success) {
                response.gameList.forEach((element : IGameInfo) => {
                    socket.emit("chat", {
                        userId: cookies.userID,
                        authToken: cookies.user,
                        eventPattern: "get_name", 
                        data: { user_id: cookies.userID, requested_user_id: element.players.player1 }
                    });
                    socket.emit("chat", {
                        userId: cookies.userID,
                        authToken: cookies.user,
                        eventPattern: "get_name", 
                        data: { user_id: cookies.userID, requested_user_id: element.players.player2 }
                    });
                });
                setGames(response.gameList);
            }
        })

        socket.on("game.spectate.start", respone => {
            if (respone.success) {
                socket.emit("game", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "game.get.gameInfo", 
                    data: { userId: cookies.userID, gameId: respone.spectateId }
                });
            }
            console.log("socket.on game.spectate.start " + respone.msg);
        });

        socket.on("game.spectate.stop", respone => {
            if (respone.success) 
                setGameinfo(gameInfo => undefined);
            console.log("socket.on game.spectate.stop " + respone.msg);
        });

        socket.on("get_name", getNameInSpectate);
        socket.on("game.get.gameInfo", getGameInfoSpectate);

        return () => {
            socket.off("game.get.gameList");
            socket.off("game.spectate.start");
            socket.off("game.spectate.stop");
            socket.off("get_name", getNameInSpectate);
            socket.off("game.get.gameInfo", getGameInfoSpectate);
        }
    }, [])

    // event listener functions
    function getNameInSpectate (response : any) {
        if (response.success) {
            console.log("get_name success " + response.requested_name);
            setNames(names => [...names, {userId: response.requested_id, name: response.requested_name}]);
        }
    }

    function getGameInfoSpectate (response : any) {
        console.log(response.msg);
        if (response.gameInfo)
            setGameinfo(gameInfo => response.gameInfo);
    }

    // helper functions
    function returnName (id : number) : string {
        const ret = names.find((e) => e.userId == id)?.name;
        return (ret === undefined ? "Unknown User": ret);
    }

    const startSpectating = (e: any, gameId : number) => {
        e.preventDefault();
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.spectate.start", 
            data: { userId: cookies.userID, targetGameId: gameId }
        });
        console.log("emitting game.spectate.start for game " + gameId);
    }

    return (
        <>
            {
            gameInfo !== undefined ?
            <SpectateCanvas gameInfo={gameInfo} setGameinfo={setGameinfo}/> :
            <>                
                <p style={{lineHeight: "0", fontSize: "1.8vw", fontWeight: "bold"}}>active games</p>
                {
                    games.length == 0 &&
                    <>there is currently no active games to spectate</>
                }        
                <div className="spectate">
                {games.map((element, index) => (
                    <div key={index} style={index%2 == 0 ? {backgroundColor: "#4b4b4b"} : {}} className="listGames">
                        <span><b>{returnName(element.players.player1)}</b> vs <b>{returnName(element.players.player2)}</b></span>
                        <button className="spectateButton" onClick={(e) => startSpectating(e, element.gameId)}>watch</button><br/>
                    </div>
                ))}
                </div>
            </>
            }
        </>
    )
}

export default Spectate;