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

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         // console.log('This will run every second!');
    //         if (document.getElementById("myDropdown")?.classList.contains("show")) {
    //             // console.log('This will run every second!');

    //             socket.emit("check_online", {
    //                 userId: cookies.userID,
    //                 authToken: cookies.user,
    //                 eventPattern: "check_online", 
    //                 data: {userId: cookies.userID, checkIds: [friend.userId]}
    //             });
        
    //             socket.emit("game", {
    //                 userId: cookies.userID,
    //                 authToken: cookies.user,
    //                 eventPattern: "game.isInGame", 
    //                 data: { userId: cookies.userID, requestedId: friend.userId }
    //             });
    //         }
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, []);

    // get statusues on mount
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
        if (response.success && response.requestedId == friend.userId)
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
    
    /*
        friends status notes:

        check if they are online or in game in an interval


        ● ■
        online color #06d60d 
        offline color #d60606

        <span style={{color: `{variable}`}}>●</span>
        <span style={{fontWeight: "lighter"}}>in game</span>

        <span style={online ? {color: "#06d60d"} : {color: "#d60606"}}>●</span>
        {
            inGame &&
            <span style={{fontWeight: "lighter"}}>in game</span>
        }
                        
    */

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