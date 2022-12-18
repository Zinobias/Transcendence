import React, { useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { IUser, SmallUser } from "../interfaces";
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
    const navigate = useNavigate();

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

    const goToProfile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, friendId : number) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + friendId,
        })
    }

    /*
        FRIEND REQUEST DIV

    <div className="friendInvite">
        <p><b>name</b> send you a friend request</p>
        <button className="friendslistButton">Accept</button>
        <button className="friendslistButton">Decline</button>
    </div>

    */
    // const mapfriends = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //     e.preventDefault();
    //     console.log("click map");
    //     user.friends.forEach((element : SmallUser) => {
    //         console.log(element);
    //     });
    // }

    return (
        <>  
            {/* <button className="friendslistButton" onClick={(e) => mapfriends(e)}>map</button> */}
            {user.friends.map((element, index) => (
                <div key={index}>
                {
                    element.state == false &&
                    <div className="friendInvite">
                        <p><b>{element.name}</b> send you a friend request</p>
                        <button className="friendslistButton" onClick={(event) => handleAccept(event, element.userId)}>Accept</button>
                        <button className="friendslistButton" onClick={(event) => handleDecline(event, element.userId)}>Decline</button>
                    </div>
                }
                </div>
            ))}
            <b>Friendslist</b>
            {user.friends.map((e, index) => (
                <div key={index} className="friendslist">
                    {
                        e.state &&
                        <div style={{cursor: "pointer"}} onClick={(event) => goToProfile(event, e.userId)}>{e.name}</div>
                    }
                </div>
            ))}
            <br/>
        </>
    );
};

export default Friendslist;