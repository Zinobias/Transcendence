import React, { useState, useRef, useEffect, useContext }  from "react";
import { Link, useNavigate } from 'react-router-dom';
import { AiFillCloseSquare } from "react-icons/ai";
import Friendslist from "./Friendslist";
import { useCookies } from 'react-cookie';
import '../App.css'
import { IChannel, IUser } from "../interfaces";
import { SocketContext } from "./Socket";
import {Md5} from "ts-md5";

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/

interface IGameInvites {
    fromUserId : number;
    fromUserName: string;
    game_mode: string;
}

const ProfileNav: React.FC = () => {
    const socket = useContext(SocketContext);
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [user, setUser] = useState<IUser>();
    const [state, setState] = useState<boolean>(false);
    const [gameInvites, setGameInvites] = useState<IGameInvites[]>([]);
    const [channelInvites, setChannelInvites] = useState<IChannel[]>([]);
    const navigate = useNavigate();
    const [pw, setPw] = useState<string>();
    var path:string = "/profile?id=" + cookies.userID; 

    // emit to get user on mount and state change to update it
    useEffect(() => {
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_user", 
            data: {user_id: cookies.userID, requested_user_id: cookies.userID}
        })
        // console.log(`emiting get_user ${cookies.userID}`);
    }, [state])

    // user event listeners
    useEffect(() => {
        socket.on("get_user", response => {
            if (response.success && response.user.userId == cookies.userID) {
                console.log("get_user success profileNav");
                // console.log(response.user);
                setUser(user => response.user);
            }
        })

        socket.on("friend_request", response => {
            if (response.success) {
                console.log(`socket.on friend_request success from ${response.user} to ${response.friend}`);
                // setState(state => !state);
                if (response.friend == cookies.userID) {
                    setState(state => !state);
                    if (document.getElementById("myDropdown")?.classList.contains("show") == false)
                        document.getElementById("myDropdown")?.classList.toggle("show");
                }
            }
            else
                console.log(`socket.on friend_request fail ${response.msg}`);
        })

        socket.on("decline_friend_request", response => {
            if (response.success && response.user == cookies.userID) {
                console.log(`socket.on decline_friend_request success`);
                setState(state => !state);
            }
            else if (!response.success)
                console.log(`socket.on decline_friend_request fail ${response.msg}`)
        })

        socket.on("accept_friend_request", response => {
            if (response.success) {
                console.log(`socket.on accept_friend_request success`);
                setState(state => !state);
            }
            else
                console.log(`socket.on accept_friend_request fail ${response.msg}`);
        })

        socket.on("un_friend", response => {
            if (response.success) {
                console.log(`socket.on un_friend success`);
                setState(state => !state);
            }
            else
                console.log(`socket.on un_friend fail ${response.msg}`);
        })

        socket.on("game.create", response => {
            if (response.success) {
                console.log("socket.on game.create success " + window.location.pathname);
                if (window.location.pathname != "/game" && window.location.pathname != "/") {
                    if (document.getElementById("myDropdown")?.classList.contains("show"))
                        document.getElementById("myDropdown")?.classList.toggle("show");
                    console.log("socket.on game.create success " + response.msg);
                    navigate('/game');
                }
            }
        })

        socket.on("accept_invite_game_user", response => {
            console.log("socket.on accept game invite " + response.success + " " + response.msg);
        });

        socket.on("channel_invite", response => {
            if (response.success) {
                // emit to channel_info_retrieve_by_id
                console.log("channel invite success emitting to get channel info")
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "channel_info_retrieve_by_id", 
                    data: {user_id: cookies.userID, channel_id: response.channel_id}
                })
            }
            else
                console.log(response.msg);
        });

        socket.on("channel_info_retrieve_by_id", response => {
            if (response.success)
                setChannelInvites(channelInvites => [...channelInvites, response.channel]);
        });

        return () => {
            socket.off("get_user");
            socket.off("friend_request");
            socket.off("accept_friend_request");
            socket.off("un_friend");
            socket.off("game.create");
            socket.off("accept_invite_game_user");
            socket.off("channel_invite")
            socket.off("channel_info_retrieve_by_id");
        }
    }, [])

    // check for game invites, update listener when user updates
    useEffect(() => {
        socket.on("invite_game_user", response => {
            if (response.success && response.request_user_id == cookies.userID && !gameInvites.find((entry) => response.user == entry.fromUserId)) {
                setGameInvites(gameInvites => [...gameInvites, {
                    fromUserId: response.user, 
                    fromUserName: response.from_user_name,
                    game_mode: response.game_mode
                }])
                if (document.getElementById("myDropdown")?.classList.contains("show") == false)
                    document.getElementById("myDropdown")?.classList.toggle("show");
            }
            console.log("socket.on invite_game_user from " + response.user + " to " + response.request_user_id + " " + response.msg);
        })

        return () => {
            socket.off("invite_game_user");
        }

    }, [user, gameInvites])

    const toggleProfile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("myDropdown")?.classList.toggle("show");
    };

    const handleAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, inviteId : number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "accept_invite_game_user", 
            data: {user_id: cookies.userID, request_user_id: inviteId}
        })
        console.log(`emiting accept_invite_game_user`);
        setGameInvites(gameInvites => gameInvites.filter((element) => element.fromUserId != inviteId));
        document.getElementById("myDropdown")?.classList.toggle("show");
    }

    const handleDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, inviteId : number) => {
        e.preventDefault();
        setGameInvites(gameInvites => gameInvites.filter((element) => element.fromUserId != inviteId));
    }

    const handleJoin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelId : number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_join",
            data: {user_id: cookies.userID, channel_id: channelId, password: (pw ? Md5.hashStr(pw + channelId) : undefined)}
        })
        setPw(pw => undefined); 
        setChannelInvites(channelInvites => channelInvites.filter((element) => element.channelId != channelId));
    }
    /*
        channel invite notes:

        if user gets an invite -> channel_info_retrieve_by_id to see if the channel has a pw or not
        if pw prompt to enter it
        
        call channel join with invite id and pw if needed 
    */

    return (
        <div className="profileNav">
            <img
                src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
                alt="defaultAvatar"
                className="profileNav__avatar"
                onClick={(e) => toggleProfile(e)}
            />
            <div id="myDropdown" className="profileNav__dropdown">

                <p style={{fontWeight: "bold"}}><Link to={path} style={{ textDecoration: "none", color: "black" }}>My Profile</Link></p>
                {gameInvites.map((element, index) => (
                    <div key={index} className="friendInvite">
                        {
                            <>
                                <p><b>{element.fromUserName}</b> invited you to <b>{element.game_mode}</b></p>
                                <button className="friendslistButton" onClick={(e) => handleAccept(e, element.fromUserId)}>Accept</button>
                                {/* <button className="friendslistButton" onClick={(e) => handleDecline(e, index)}>Decline</button> */}
                            </>
                        }
                    </div>
                ))}
                {channelInvites.map((element, index) => (
                    <div key={index} className="friendInvite">
                        {
                            <>
                                <p>you got invited to chatroom <b>{element.channelName}</b></p>
                                {
                                    element.password &&
                                    <>
                                    <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} style={{borderBottom: "solid 1px black"}} className="settingsInput"/>
                                    </>
                                }
                                <button className="friendslistButton" onClick={(e) => handleJoin(e, element.channelId)}>{element.password ? "enter pw" : "join"}</button>
                                {/* <button className="friendslistButton" onClick={(e) => handleDecline(e, index)}>Decline</button> */}
                            </>
                        }
                    </div>
                ))}
                {
                    user &&
                    <Friendslist user={user}/>
                }
            </div>
        </div>
      );
}

export default ProfileNav;