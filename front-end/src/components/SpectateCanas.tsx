import React, { useRef, useEffect, useContext, useState }  from 'react'
import { useCookies } from 'react-cookie';
import { IEntity, IGameInfo } from '../DTOs/frontend.DTOs.game.matchmaking';
import { SocketContext } from './Socket';

enum Move {
	keyPressUp = 0,
	keyReleaseUp = 1,
	keyPressDown = 2,
	keyReleaseDown = 3,
}
interface Props {
    gameInfo : IGameInfo;
    setGameinfo: React.Dispatch<React.SetStateAction<IGameInfo | undefined>> ;
};

const SpectateCanvas : React.FC<Props> = ({gameInfo, setGameinfo}) => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [entities, setEntities] = useState<IEntity[]>([]);
    const [p1Score, setP1score] = useState<number>(gameInfo.playerScores.player1Score);
    const [p2Score, setP2score] = useState<number>(gameInfo.playerScores.player2Score);
    const [p1, setP1] = useState<string>("");
    const [p2, setP2] = useState<string>("");
    const [winner, setWinner] = useState<string>("");

    const [count, setCount] = useState<number>(0);
    const [ret, setRet] = useState<number>(0);

    const canvasWidth : number = 512*2;
    const canvasHeight : number = 256*2;
    const ogCanvWidth : number = 512;
    const ogCanvHeight : number = 256;

    const mushroom = new Image();
    mushroom.src = "https://i.imgur.com/G39eWqq.png";

    const pepper = new Image();
    pepper.src = "https://i.imgur.com/LPLy2U4.png";

      
    // event listener for game events & get_name
    useEffect(() => {
        console.log("Canvas component did mount with gameId " + gameInfo.gameId);

        // request player names on mount
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_name", 
            data: { user_id: cookies.userID, requested_user_id: gameInfo.players.player1 }
        });

        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_name", 
            data: { user_id: cookies.userID, requested_user_id: gameInfo.players.player2 }
        });

        socket.on(`game.frame.update.` + gameInfo.gameId, gameFrameUpdtateSpectate);
        socket.on(`game.score.` + gameInfo.gameId, gameScoreSpectate);
        socket.on("get_name", getNameInSpectateCanvas);

        return () => {
            socket.off(`game.frame.update.` + gameInfo.gameId, gameFrameUpdtateSpectate);
            socket.off(`game.score.` + gameInfo.gameId, gameScoreSpectate);
            socket.off("get_name", getNameInSpectateCanvas);
        }
    }, [])

    // rerun this effect to get the correct names
    useEffect(() => {
        socket.on(`game.ended.` + gameInfo.gameId, gameEndedSpectate);

        return () => {
            socket.off(`game.ended.` + gameInfo.gameId, gameEndedSpectate);
        }
    }, [p1, p2])

    //event listener functions
    function getNameInSpectateCanvas (response : any) {
        if (response.requested_id == gameInfo.players.player1)
            setP1(p1 => response.requested_name);
        if (response.requested_id == gameInfo.players.player2)
            setP2(p2 => response.requested_name); 
    }

    function gameEndedSpectate (response : any) {
        console.log("socket.on game.ended winner " + response.winner);
        setWinner(winner => (response.winner == gameInfo.players.player1 ? p1 : p2));
    }

    function gameScoreSpectate (response : any) {
        setP1score(p1Score => response.player1Score);
        setP2score(p2Score => response.player2Score);
    }

    function gameFrameUpdtateSpectate (response : any) {
        setEntities([]);
        response.forEach((element : IEntity) => {
            setEntities(entities => [...entities, element]);
        });
    }

    // helper functions
    function returnColor () : string {
        const colors = ['#9400D3', '#0000FF', '#00FF00', '#FFF000', '#FF7F00', '#FF000'];
        if (count === 0)
            setRet(ret => Math.floor(Math.random() * (5 - 0 + 1)) + 0);
        setCount(count => (count === 8 ? 0 : count + 1));
        return (colors[ret]);
    }

    // redraw canvas on state change
    useEffect(() => {
        const canvas : HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (ctx && entities) {
            ctx.beginPath();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([13, 5]);
            ctx.lineWidth = 1;
            ctx.moveTo(canvas.width/2, 0);
            ctx.lineTo(canvas.width/2, canvas.height);
            ctx.strokeStyle = '#ffffff';
            entities.forEach((e) => {
                if (gameInfo.gameMode === "DISCOPONG" && e.type === "pepper") 
                    ctx.drawImage(pepper, getX(e.pos.x, e.width), getY(e.pos.y, e.height), (e.width*2), (e.height*2));
                else if (gameInfo.gameMode === "DISCOPONG" && e.type === "mushroom")
                    ctx.drawImage(mushroom, getX(e.pos.x, e.width), getY(e.pos.y, e.height), (e.width*2), (e.height*2));
                else {
                    if (gameInfo.gameMode === "DISCOPONG" && (e.type === "ball" && (e.width > 8 || (e.velocityVector!.x >= 1.5 || e.velocityVector!.x <= -1.5 ))))
                        ctx.fillStyle = returnColor();
                    else
                        ctx.fillStyle = '#ffffff';
                    ctx.fillRect(getX(e.pos.x, e.width), getY(e.pos.y, e.height), (e.width*2), (e.height*2));
                }
            });
            ctx.stroke();
        }
    }, [entities])

    // get translated x position value
    function getX (x : number, width : number) : number {
        return (((ogCanvWidth/2) + x - (width/2)) * 2);
    }

    // get translated y position value
    function getY (y : number, height : number) : number {
        return (((ogCanvHeight/2) - y - (height/2)) * 2);
    }

    const spectateStop = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.spectate.stop", 
            data: { userId: cookies.userID, targetGameId: gameInfo.gameId }
        });
        console.log("emitting game.spectate.sttop for game " + gameInfo.gameId);
    }
    
    return (
        <>
            <div style={{width: `${canvasWidth}px`}}>
                <br/>
                <span className='gameLeft' style={{fontSize: "35px", lineHeight: "0"}}>{p1Score}</span>
                <span className='gameRight' style={{fontSize: "35px",lineHeight: "0"}}>{p2Score}</span><br/>
                <span className='gameLeft'>{p1}</span>
                <span className='gameRight'>{p2}</span>
            </div>
            <canvas className="gameCanvas" id="gameCanvas" width={canvasWidth} height={canvasHeight} />
            {
                winner ?
                <>
                    <p style={{fontSize: "30px", lineHeight: "0"}}>{winner} WON THE GAME!</p>
                    <button style={{marginTop: "0px"}}className="gameButton" onClick = {() => setGameinfo(gameInfo => undefined)}>go back</button>
                </> : 
                <>
                    <button style={{marginTop: "0px"}}className="gameButton" onClick = {(e) => spectateStop(e)}>go back</button>
                </>
            }
        </>
    )
}

export default SpectateCanvas;