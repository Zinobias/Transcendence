import { useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { IUser } from '../interfaces'
import { UserFriendSettings, UserSettings } from './ProfileUserUtils';
import { SocketContext } from './Socket';

interface Props {
    user: IUser;
    queryId: number;
}

interface history {
    createAt : string;
    vsId : number;
    vsName? : string;
    winnerId : number;
}

interface INames {
    userId  : number;
    name    : string;
}

const ProfileUser : React.FC<Props> = ({user, queryId}) => {
    const defaultAvatar = "./SourceImages/default_avatar.png";
    const [cookies] = useCookies(['userID', 'user']);
    const socket = useContext(SocketContext);
    const [gamesWon, setGameswon] = useState<number>(0);
    const [gamesLost, setGameslost] = useState<number>(0);
    const [gamehistory, setGamehistory] = useState<history[]>([]);
    const [names, setNames] = useState<INames[]>([]);
    const [online, setOnline] = useState<boolean>(false);
    const [inGame, setIngame] = useState<boolean>(false);

    // get user stats and update on user change
    useEffect(() => {
        
        setGamehistory([]);
        socket.on("game.user.get.history", response => {
            if (response.success) {
                let lost : number = 0;
                let won : number = 0;
                let ids : number[] = [];
                // console.log("get game history success");
                response.history.forEach((e : any) => {
                    setGamehistory(gamehistory => [...gamehistory, {
                        createAt: e.createAt, 
                        vsId: e.userId1 == user.userId ? e.userId2 : e.userId1, 
                        winnerId: e.winnerId
                    }]);
                    let ret = ids.find((element) => element == (e.userId1 == user.userId ? e.userId2 : e.userId1));
                    if (ret === undefined) {
                        ids.push(e.userId1 == user.userId ? e.userId2 : e.userId1);
                        socket.emit("chat", {
                            userId: cookies.userID,
                            authToken: cookies.user,
                            eventPattern: "get_name", 
                            data: { user_id: cookies.userID, requested_user_id: e.userId1 == user.userId ? e.userId2 : e.userId1 }
                        });
                        // console.log("emit to get_name " + (e.userId1 == user.userId ? e.userId2 : e.userId1));
                    }
                    e.winnerId == user.userId ? won++ : lost++;
                })
                setGameswon(gamesWon => won);
                setGameslost(gamesLost => lost);
            }
        })

        socket.on("check_online", checkOnlineProfile);
        socket.on("game.isInGame", gameIsInGameInProfile);
        socket.on("get_name", getNameInProfile);

        socket.emit("check_online", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "check_online", 
            data: {userId: cookies.userID, checkIds: [user.userId]}
        });

        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.isInGame", 
            data: { userId: cookies.userID, requestedId: user.userId }
        });

        socket.emit("game", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "game.user.get.history", 
            data: { userId: cookies.userID, requestedId: user.userId }
        });
        console.log("emit get game history");

        return () => {
            socket.off("game.user.get.history");
            socket.off("check_online", checkOnlineProfile);
            socket.off("game.isInGame", gameIsInGameInProfile);
            socket.off("get_name", getNameInProfile);
        }
    }, [user])

    // event listener functions
    function gameIsInGameInProfile (response : any) {
        if (response.success) {
            console.log("game in game " + response.msg);
            setIngame(inGame => true);
        }
        else
            setIngame(inGame => false);
        // console.log(response.msg);
    }

    function getNameInProfile (response : any) {
        if (response.success) {
            // console.log("get_name success " + response.requested_name);
            setNames(names => [...names, {userId: response.requested_id, name: response.requested_name}]);
        }
    }

    function checkOnlineProfile (response : any) {
        if (response.onlineUsers[0] == user.userId)
            setOnline(online => true);
    }

    // helper functions
    function returnDate (timestamp : string) : string {
        const date = new Date(Number(timestamp));
        return(`${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`);
    }

    function returnName (id : number) : string {
        const ret = names.find((e) => e.userId == id)?.name;
        return (ret === undefined ? "Unknown User": ret);
    }

    function toBlob() : Blob {
        var imageArray = new Uint8Array(user.avatar.data);
        const newBlob = new Blob([imageArray]);
        return (newBlob);
    }
    
    return (
    <>
        <div className='profileLeft'>
            <div className='profileAvatar'>
            {
                user.avatar ?
                <img src={URL.createObjectURL(toBlob())} alt="userAvatar" className="profileAvatar_image" /> :
                <img src={defaultAvatar} alt="defaultAvatar" className="profileAvatar_image"/> 
            }
            </div>
            <b style={{fontSize: "1.6vw"}}>{user.name}</b><br/>
            {
                online ?
                <span style={{fontSize: "1vw"}}>online</span> :
                <span style={{fontSize: "1vw"}}>offline</span>
            }
            {
                inGame &&
                <span style={{fontSize: "1vw"}}>, in Game</span>
            }
            <br/><br/>
            {
                queryId == cookies.userID ? 
                <UserSettings user={user}/> :
                <UserFriendSettings user={user}/>
            }
        </div>
        <div className='profileRight'>
            <div className='rightTop'>
                <p style={{fontSize: "100%", lineHeight: "0", fontWeight: "bold"}}>stats</p>
                <p>games won: {gamesWon}</p>
                <p style={{lineHeight: "0"}}>games lost: {gamesLost}</p><br/>
            </div>
            <div className='rightBottom'>            
                <p style={{fontSize: "100%", lineHeight: "0", fontWeight: "bold"}}>match history</p>
                <div className='listHistory'>
                    {gamehistory.map((element, index) => (
                        <div key={index} style={index%2 ? {backgroundColor: "#4b4b4b"} : {}} >
                            <span className='floatLeft'>{returnDate(element.createAt)}</span>
                            <span className='floatRight'> {element.winnerId == user.userId ? "WIN" : "LOSS"} <b>vs</b> {returnName(element.vsId)}</span><br/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
    )
}

export default ProfileUser