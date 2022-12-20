import React, { useState, useEffect, useContext }  from "react";
import { Link, useNavigate } from 'react-router-dom';
import Friendslist from "./Friendslist";
import { useCookies } from 'react-cookie';
import '../App.css'
import { IUser } from "../interfaces";
import { SocketContext } from "./Socket";
import {Md5} from "ts-md5";

interface IChannelInvites {
    fromUserId : number;
    channelId : number;
    channelName : string;
    password : boolean;
}
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
    const [channelInvites, setChannelInvites] = useState<IChannelInvites[]>([]);
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
                setChannelInvites(channelInvites => [...channelInvites, {
                    fromUserId: response.inviter_id, 
                    channelId: response.channel_id, 
                    channelName: response.channel_name,
                    password: response.has_password
                }])
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
            if (response.success && response.request_user_id == cookies.userID) {
                let index = gameInvites.findIndex((e) => e.fromUserId == response.user);
                if (index != -1) {
                    let newArr = [...gameInvites]; 
                    newArr[index] = {
                        fromUserId: response.user, 
                        fromUserName: response.from_user_name,
                        game_mode: response.game_mode
                    }; 
                    setGameInvites(newArr);
                }
                else {
                    setGameInvites(gameInvites => [...gameInvites, {
                        fromUserId: response.user, 
                        fromUserName: response.from_user_name,
                        game_mode: response.game_mode
                    }])
                }
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

    const gameAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, inviteId : number) => {
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

    const gameDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, inviteId : number) => {
        e.preventDefault();
        setGameInvites(gameInvites => gameInvites.filter((element) => element.fromUserId != inviteId));
    }

    const channelInviteAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelId : number) => {
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
    
    const channelInviteDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, channelId : number, fromUser : number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_invite_deny",
            data: {user_id: cookies.userID, channel_id: channelId, inviter_id: fromUser}
        })
        setPw(pw => undefined); 
        setChannelInvites(channelInvites => channelInvites.filter((element) => element.channelId != channelId));
    }

    return (
        <div className="profileNav">
            <img
                src="./SourceImages/profile_icon.png"
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
                                <button className="friendslistButton" onClick={(e) => gameAccept(e, element.fromUserId)}>Accept</button>
                                <button className="friendslistButton" onClick={(e) => gameDecline(e, element.fromUserId)}>Accept</button>
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
                                <button className="friendslistButton" onClick={(e) => channelInviteAccept(e, element.channelId)}>{element.password ? "enter pw" : "join"}</button>
                                <button className="friendslistButton" onClick={(e) => channelInviteDecline(e, element.channelId, element.fromUserId)}>Decline</button>
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