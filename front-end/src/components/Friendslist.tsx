import React, { useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import { IUser } from "../interfaces";
import { SocketContext } from "./Socket";

interface Props {
    user: IUser;
}

/*
	TO DO:
	- Show online/offline
	- Show ingame or now
*/

const Friendslist: React.FC<Props> = ({user}) => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    const handleAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, friendId: number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "accept_friend_request", 
            data: {user_id: cookies.userID, friend_id: friendId}
        })
        console.log(`emiting accept_friend_request for users ` + friendId + ` ` + cookies.userID);
    }

    const handleDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, friendId: number) => {
        e.preventDefault();
        console.log("click decline");
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "decline_friend_request", 
            data: {user_id: cookies.userID, friend_id: friendId}
        })
        console.log(`emiting decline_friend_request`);
    }

    /*
        FRIEND REQUEST DIV

    <div className="friendInvite">
        <p><b>name</b> send you a friend request</p>
        <button className="friendslistButton">Accept</button>
        <button className="friendslistButton">Decline</button>
    </div>

    */

    return (
        <>  
            {user.friends.map((element, index) => (
                <div key={index} className="friendInvite">
                {
                    element.confirmed == false &&
                    <>
                        <p><b>{element.IUser.name} {element.IUser.userId}</b> send you a friend request</p>
                        <button className="friendslistButton" onClick={(event) => handleAccept(event, element.IUser.userId)}>Accept</button>
                        <button className="friendslistButton" onClick={(event) => handleDecline(event, element.IUser.userId)}>Decline</button>
                    </>
                }
                </div>
            ))}
            <p><b>Friendslist:</b></p>
            {user.friends.map((e, index) => (
                <div key={index} className="friendslist">
                    <p>{e.IUser.name} {e.confirmed}</p>
                    {/* <li className="friendslist">{e.IUser.name} {e.confirmed}</li> */}
                    {/* {
                        e.confirmed &&
                        <li key={e.IUser.userId} className="friendslist">{e.IUser.name}</li>
                    } */}
                </div>
            ))}
        </>
    );
};

export default Friendslist;