import React, { useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { IUser, SmallUser } from "../interfaces";
import FriendslistUtils from "./FriendslistUtils";
import { SocketContext } from "./Socket";

interface Props {
    user: IUser;
}


const Friendslist: React.FC<Props> = ({user}) => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.getElementById("myDropdown")?.classList.contains("show") && user.friends.length > 0) {
                let ids : number[]  = user.friends.map(friend => friend.userId);

                socket.emit("check_online", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "check_online", 
                    data: {userId: cookies.userID, checkIds: ids}
                });
        
                user.friends.forEach((e : SmallUser) => {
                    if (e.state) {
                        socket.emit("game", {
                            userId: cookies.userID,
                            authToken: cookies.user,
                            eventPattern: "game.isInGame", 
                            data: { userId: cookies.userID, requestedId: e.userId }
                        });
                    }
                })
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [user]);

    const handleAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, friendId: number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "accept_friend_request", 
            data: {user_id: cookies.userID, friend_id: friendId}
        })
        // console.log(`emiting accept_friend_request for users ` + friendId + ` ` + cookies.userID);
    }

    const handleDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, friendId: number) => {
        e.preventDefault();
        // console.log("click decline");
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "decline_friend_request", 
            data: {user_id: cookies.userID, friend_id: friendId}
        })
        // console.log(`emiting decline_friend_request`);
    }

    const goToProfile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, friendId : number) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + friendId,
        })
    }

    return (
        <>  
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
                        <FriendslistUtils friend={e}/>
                    }
                </div>
            ))}
            <br/>
        </>
    );
};

export default Friendslist;