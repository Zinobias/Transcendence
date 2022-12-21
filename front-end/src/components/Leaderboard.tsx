import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "./Socket";

interface leaderboardArray {
    winnerId: number;
    count: number;
}

interface INames {
    userId  : number;
    name    : string;
}

const   Leaderboard: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [leaderboard, setLeaderboard] = useState<leaderboardArray[]>([]);
    const [names, setNames] = useState<INames[]>([]);


    // emit to get leaderboard on component mount
    useEffect(() => {

        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.get.leaderboard", 
            data: {userId: cookies.userID}
        });
        // console.log("emiting game.get.leaderboard");

        socket.on("game.get.leaderboard", response => {
            if (response.success && response.leaderboard.length > 0) {
                // empty leaderboard just to be sure
                let tmpId : number[] = [];
                setLeaderboard([]);
                response.leaderboard.sort((a : leaderboardArray, b: leaderboardArray) => (a.count < b.count) ? 1 : -1);
                setLeaderboard(response.leaderboard);
                response.leaderboard.forEach((entry : leaderboardArray) => {
                    if (!tmpId.find((id) => id == entry.winnerId)) {
                        tmpId.push(entry.winnerId);
                        socket.emit("chat", {
                            userId: cookies.userID,
                            authToken: cookies.user,
                            eventPattern: "get_name", 
                            data: { user_id: cookies.userID, requested_user_id: entry.winnerId }
                        });
                        // console.log("emitting get name");
                    }

                });
            }
            // else 
            //     console.log(response.msg);
        })

        socket.on("get_name", getNameInLeaderboard);

        return () => {
            socket.off("game.get.leaderboard");
            socket.off("get_name", getNameInLeaderboard);
        }
    }, [])
    
    // get_name event listener function
    function getNameInLeaderboard (response : any) {
        if (response.success) {
            // console.log("get_name success leaderboard " + response.requested_name);
            setNames(names => [...names, {userId: response.requested_id, name: response.requested_name}]);
        }
    }

    // helper functions
    function returnName (id : number) : string {
        const ret = names.find((e) => e.userId == id)?.name;
        return (ret === undefined ? "Unknown User": ret);
    }

    return (
        <>
            {
                leaderboard.length == 0 ?
                    <div>
                        Leaderboard currently empty.
                    </div>
                    :
                    <div className="leaderboard">
                        {leaderboard.map((element, index) => (
                            <div key={index} style={index%2 ? {backgroundColor: "#4b4b4b"} : {}} className="listLeaderboard">
                                <span style={{float: "left"}}>{index+1}. <b> {returnName(element.winnerId)}</b></span>
                                <span style={{float: "right"}}>games won: <b>{element.count}</b></span><br/>
                            </div>
                        ))}
                    </div>
            }
        </>
    )
};

export default Leaderboard;