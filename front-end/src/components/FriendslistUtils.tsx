import React, { useEffect, useContext, useState } from "react";
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
    const [online, setOnline] = useState<boolean>(false);
    const [inGame, setIngame] = useState<boolean>(false);

    // event listeners to get friend status
    useEffect(() => {

        socket.on("check_online", checkOnlineFriendslist);
        socket.on("game.isInGame", checkInGameFriendslist);

        return () => {
            socket.off("check_online", checkOnlineFriendslist);
            socket.off("game.isInGame", checkInGameFriendslist);
        }
        
    }, [friend])

    // event listener functions
    function checkOnlineFriendslist (response : {onlineUsers : number[], offlineUsers : number[]}) {
        if (response.onlineUsers.find((e : number) => e == friend.userId) != undefined)
            setOnline(online => true);
        else
            setOnline(online => false);
    }

    function checkInGameFriendslist (response : any) {
        if (response.ingameUsers.find((e : number) => e == friend.userId) != undefined)
            setIngame(inGame => true);
        else
            setIngame(inGame => false);
    }

    const goToProfile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + friend.userId,
        })
    }
    
    return (
        <>
        <div style={{cursor: "pointer"}} onClick={(e) => goToProfile(e)}>{friend.name}<span style={online ? {color: "#06d60d"} : {color: "#d60606"}}> ●</span></div>
        {
            inGame &&
            <span style={{fontWeight: "lighter"}}>in game</span>
        }
        </>
    )
}

export default FriendslistUtils;