import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "./Socket";

interface leaderboardArray {
    name?: string;
    id: number;
    count: number;
}

const   Leaderboard: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [leaderboard, setLeaderboard] = useState<leaderboardArray[]>([]);


    // emit to get leaderboard on component mount
    useEffect(() => {

        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.get.leaderboard", 
            data: {userId: cookies.userID}
        });
        console.log("emiting game.get.leaderboard");

        socket.on("game.get.leaderboard", response => {
            if (response.success) {
                console.log("socket.on game.get.leaderboard success");
                // sort the leaderboard
                response.leaderboard.sort((a : leaderboardArray, b: leaderboardArray) => (a.count < b.count) ? 1 : -1);
                response.leaderboard.forEach((e : any) => {
                    // set array and emit to get names
                    setLeaderboard(leaderboard => [...leaderboard, {id: e.winnerId, count: e.count}]);
                    socket.emit("chat", {
                        userId: cookies.userID,
                        authToken: cookies.user,
                        eventPattern: "get_name", 
                        data: { user_id: cookies.userID, requested_user_id: e.winnerId }
                    });

                });
            }
            else 
                console.log(response.msg);
        })

        return () => {
            socket.off("game.get.leaderboard");
        }
    }, [])

    // listener to update the name in the leaderboard array
    useEffect(() => {
        socket.on("get_name", response => {
            if (response.success) 
                setLeaderboard(leaderboard.map((entry) => (entry.id == response.requested_id ? {...entry, name: response.requested_name} : entry)));
        })

        return () => {
            socket.off("get_name");
        }

    }, [leaderboard])

    return (
        <div>
            <b>Leaderboard</b>
            <br/>
            <br/>
            <div className="chats">

            {leaderboard.map((element, index) => (
                <div key={index} className="listChat__text">
                   user: <b>{element.name}</b> games won: <b>{element.count}</b>
                </div>
            ))}
            </div>
        </div>
    )
};

export default Leaderboard;