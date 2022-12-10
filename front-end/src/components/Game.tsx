import React from "react";
import { DefaultMatchmaking, DiscoMatchmaking, LeavetMatchmaking } from "./GameUtils";

const   Game: React.FC = () => {
    return (
        <>
            <p>game</p>
            <DefaultMatchmaking />
            <LeavetMatchmaking />
            {/* <DiscoMatchmaking /> */}
        </>
    )
};

export default Game;