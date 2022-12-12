import React, { useRef, useEffect, useContext, useState }  from 'react'
import { useCookies } from 'react-cookie';
import { IEntity } from '../DTOs/frontend.DTOs.game.matchmaking';
import { SocketContext } from './Socket';

enum Move {
	keyPressUp = 0,
	keyReleaseUp = 1,
	keyPressDown = 2,
	keyReleaseDown = 3,
}
interface Props {
    gameId : number;
};

/* 
    CANVA NOTES

        width/x = 1024
        height/y = 512

        i get pos x/y ->    x = w/2 + x*2 
                            y = h/2 + y*2

        clear all rects ->
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    ENTITIES

    IEntity {
        pos				: IVec2,
        velocityVector? : IVec2,
        height 			: number,
        width 			: number,
        type			: string,
    };

        all entities are going to be rectangles
        players(1 and 2), ball
    
    MOVE PADDLE ENUM

    export enum MoveStatePaddle {
        keyPressUp = 0,
        keyReleaseUp = 1,
        keyPressDown = 2,
        keyReleaseDown = 3,
    }

*/

const GameCanvas : React.FC<Props> = ({gameId}) => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [entities, setEntities] = useState<IEntity[]>([]);
    const [up, setUp] = useState<boolean>(false);
    const [down, setDown] = useState<boolean>(false); 

    const canvasWidth : number = 512*2;
    const canvasHeight : number = 256*2;
    const ogCanvWidth : number = 512;
    const ogCanvHeight : number = 256;

    useEffect(() => {
        const keyPress = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp" && up === false) {
                setUp(up => true);
                socket.emit("game", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "game.player.move", 
                    data: { userId: cookies.userID, keyEvent: Move.keyPressUp }
                });
                // console.log(`socket.emit ${event.key} is being pressed`);
            }
            if (event.key === "ArrowDown" && down === false) {
                setDown(down => true);
                socket.emit("game", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "game.player.move", 
                    data: { userId: cookies.userID, keyEvent: Move.keyPressDown }
                });
                // console.log(`socket.emit ${event.key} is being pressed`);
            }
        };

        const keyRelease = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp") {
                setUp(up => false);   
                socket.emit("game", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "game.player.move", 
                    data: { userId: cookies.userID, keyEvent: Move.keyReleaseUp }
                });             
                // console.log(`socket.emit ${event.key} is being released`)
            }
            if (event.key === "ArrowDown") {
                setDown(down => false);
                socket.emit("game", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "game.player.move", 
                    data: { userId: cookies.userID, keyEvent: Move.keyReleaseDown }
                });
                // console.log(`socket.emit ${event.key} is being released`)
            }
        };

        window.addEventListener('keydown', keyPress);
        window.addEventListener('keyup', keyRelease);
        
        return () => {
            window.removeEventListener('keydown', keyPress);
            window.removeEventListener('keyup', keyRelease);
        };
    }, [up, down]);

   
    // event listener for game.ended
    useEffect(() => {
        socket.on(`game.ended.` + gameId, response => {
            // change state to display winning prompt to be clicked away and then normal page again
            // chaange activeGameId
            console.log("socket.on game.ended winner " + response.winner);
        })

        return () => {
            socket.off(`game.ended.` + gameId);
        }
    }, [])

    // game frame event listener
    useEffect(() => {
        console.log("Canvas component did mount with gameId " + gameId);

        socket.on(`game.frame.update.` + gameId, response => {
            setEntities([]);
            // console.log("--- ENTITIES ---");
            response.forEach((element : IEntity) => {
                // console.log(element);
                setEntities(entities => [...entities, element]);
            });
            // console.log("socket.on game.frame.update");
            // console.log(response[0]);
        })

        return () => {
            socket.off(`game.frame.update.` + gameId);
        }
    }, [])

    // draw again state change
    useEffect(() => {
        const canvas : HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (ctx && entities) {
            ctx.beginPath();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            entities.forEach((e) => {
                ctx.fillStyle = '#000000';
                ctx.fillRect(getX(e.pos.x, e.width), getY(e.pos.y, e.height), (e.width*2), (e.height*2));
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
    
    return (
        <canvas className="gameCanvas" id="gameCanvas" width={canvasWidth} height={canvasHeight} />
    )
}

export default GameCanvas;