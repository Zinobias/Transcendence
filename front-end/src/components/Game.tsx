import React from "react";
import { DefaultMatchmaking, DiscoMatchmaking } from "./Buttons";

const   Game: React.FC = () => {
    return (
        <>
            <p>game</p>
            <DefaultMatchmaking />
            <DiscoMatchmaking />
        </>
    )
};

export default Game;