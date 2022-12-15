import React, { useEffect }  from 'react'

const GameTestCanvas : React.FC = () => {

    const canvasWidth : number = 512*2;
    const canvasHeight : number = 256*2;

    const mushroom = new Image();
    mushroom.src = "https://i.imgur.com/jsIjSBu.png";

    const pepper = new Image();
    pepper.src = "https://i.imgur.com/3uTSvEG.png";

    useEffect(() => {
        const canvas : HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.setLineDash([13, 5]);
            ctx.lineWidth = 2;
            ctx.moveTo(canvas.width/2, 0);
            ctx.lineTo(canvas.width/2, canvas.height);
            ctx.fillRect(20, 236, 20, 50);
            ctx.strokeStyle = '#ffffff';
            pepper.onload = () => {
                ctx.drawImage(pepper, 30, 30, 8*2, 28*2);
            }
            mushroom.onload = () => {
                ctx.drawImage(mushroom, 80, 80, 14*2, 14*2)
            }
            ctx.stroke();
        }
    }, [])
    
    return (
        <>
            <div style={{width: `${canvasWidth}px`}}>
                <span className='gameLeft'>Player 1</span>
                <span className='gameRight'>Player 2</span><br/>
                <span className='gameLeft' style={{fontSize: "30px"}}>8</span>
                <span className='gameRight' style={{fontSize: "30px"}}>9</span>
            </div>
            <canvas className="gameCanvas" id="gameCanvas" width={canvasWidth} height={canvasHeight} />

        </>
    )
}

export default GameTestCanvas;