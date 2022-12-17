import { useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { SlSocialVkontakte } from 'react-icons/sl';
import { UrlWithStringQuery } from 'url';
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

const ProfileUser : React.FC<Props> = ({user, queryId}) => {
    const defaultAvatar = "https://ynnovate.it/wp-content/uploads/2015/04/default-avatar.png";
    const [cookies] = useCookies(['userID', 'user']);
    const socket = useContext(SocketContext);
    const [gamesWon, setGameswon] = useState<number>(0);
    const [gamesLost, setGameslost] = useState<number>(0);
    const [gamehistory, setGamehistory] = useState<history[]>([]);
    const [online, setOnline] = useState<boolean>(false);
    const [inGame, setIngame] = useState<boolean>(false);

    // get user stats and update on user change
    useEffect(() => {
        
        socket.on("game.user.get.history", response => {
            if (response.success) {
                let lost : number = 0;
                let won : number = 0;
                setGamehistory(gamehistory => []);
                console.log("get game history success");
                // console.log(response.history);
                response.history.forEach((e : any) => {
                    setGamehistory(gamehistory => [...gamehistory, {
                        createAt: e.createAt, 
                        vsId: e.userId1 == user.userId ? e.userId2 : e.userId1, 
                        winnerId: e.winnerId
                    }]);
                    // emit to get name of other player
                    socket.emit("chat", {
                        userId: cookies.userID,
                        authToken: cookies.user,
                        eventPattern: "get_name", 
                        data: { user_id: cookies.userID, requested_user_id: e.userId1 == user.userId ? e.userId2 : e.userId1 }
                    });
                    // count how many times user won
                    e.winnerId == user.userId ? won++ : lost++;
                })
                setGameswon(gamesWon => won);
                setGameslost(gamesLost => lost);
            }
        })

        socket.on("check_online", response => {
            if (response.onlineUsers[0] == user.userId)
                setOnline(online => true);
        })

        socket.on("game.isInGame", gameIsInGameInProfile);

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

        return () => {
            socket.off("game.user.get.history");
            socket.off("check_online");
            socket.off("game.isInGame", gameIsInGameInProfile);
        }
    }, [user])

    useEffect(() => {
        socket.on("get_name", getNameInProfile)

        return () => {
            socket.off("get_name", getNameInProfile);
        }

    }, [gamehistory])

    // event listener functions
    function gameIsInGameInProfile (response : any) {
        if (response.success)
            setIngame(inGame => true);
    }

    function getNameInProfile (response : any) {
        if (response.success) 
            setGamehistory(gamehistory.map((entry) => (entry.vsId == response.requested_id ? {...entry, vsName: response.requested_name} : entry)));
    }

    function returnDate (timestamp : string) : string {
        const date = new Date(Number(timestamp));
        return(`${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`);
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
            <b style={{fontSize: "1.8vw"}}>{user.name}</b><br/>
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
                            <span className='floatRight'> {element.winnerId == user.userId ? "WIN" : "LOSS"} <b>vs</b> {element.vsName}</span><br/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
    )
}

export default ProfileUser