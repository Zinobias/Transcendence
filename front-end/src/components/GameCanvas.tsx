import React, { useRef, useEffect, useContext, useState }  from 'react'
import { useCookies } from 'react-cookie';
import { IEntity } from '../DTOs/frontend.DTOs.game.matchmaking';
import { SocketContext } from './Socket';

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

*/

const GameCanvas : React.FC<Props> = ({gameId}) => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [entities, setEntities] = useState<IEntity[]>([]);

    const canvasWidth : number = 512*2;
    const canvasHeight : number = 256*2;
    const ogCanvWidth : number = 512;
    const ogCanvHeight : number = 256;

    // game frame event listener
    useEffect(() => {
        console.log("Canvas component did mount with gameId " + gameId);
        
        socket.on(`game.frame.update.` + gameId, response => {
            // setEntities(entities => response);

            setEntities([]);
            response.forEach((element : IEntity) => {
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
                ctx.rect(getX(e.pos.x, e.width), getY(e.pos.y, e.height), (e.width*2), (e.height*2));
            });
            ctx.stroke();
        }
    }, [entities])

    // get translated x position value
    function getX (x : number, width : number) : number {
        return (((ogCanvWidth/2) + x + (width/2)) * 2);
    }

    // get translated y position value
    function getY (y : number, height : number) : number {
        return (((ogCanvHeight/2) + y - (height/2)) * 2);
    }
    
    return (
        <canvas className="gameCanvas" id="gameCanvas" width={canvasWidth} height={canvasHeight} />
    )
}

export default GameCanvas;