import React, { useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { SmallUser } from "../interfaces";
import { SocketContext } from "./Socket";

interface Props {
    friend: SmallUser;
}

const FriendslistUtils : React.FC<Props> = ({friend}) => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const navigate = useNavigate();

    // get statusues on mount
    useEffect(() => {
        socket.emit("check_online", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "check_online", 
            data: {userId: cookies.userID, checkIds: [friend.userId]}
        });

        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.isInGame", 
            data: { userId: cookies.userID, requestedId: friend.userId }
        });
    }, [])

    const goToProfile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + friend.userId,
        })
    }

    return (
        <>
        <div style={{cursor: "pointer"}} onClick={(e) => goToProfile(e)}>{friend.name}</div>
        </>
    )
}

export default FriendslistUtils;