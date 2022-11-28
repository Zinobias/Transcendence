import React, { useEffect, useContext } from "react";
import { StringLiteral } from "typescript";
import { SocketContext } from "./Socket";

interface i_Friendslist {
    name: string;
    userID: number;
    // online: boolean;
}


/*
	TO DO:
	- Show online/offline
	- Show ingame or now
*/

const Friendslist: React.FC = () => {
    const socket = useContext(SocketContext);
    var friends: i_Friendslist[] = [
        {name: "zino", userID: 1},
        {name: "stijn", userID: 2},
        {name: "abba", userID: 3},
    ];

    return (
        <>
            <p style={{textAlign: "left"}}>Friendslist Placeholder</p>
            {friends.map((e) => (
                <li key={e.userID} className="friendslist">{e.name}</li>
            ))}
        </>
    );
};

export default Friendslist;