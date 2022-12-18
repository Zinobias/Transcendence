import React, { useState, useRef, useEffect, useContext }  from "react";
import { Link, useNavigate } from 'react-router-dom';
import { AiFillCloseSquare } from "react-icons/ai";
import Friendslist from "./Friendslist";
import { useCookies } from 'react-cookie';
import '../App.css'
import { IUser } from "../interfaces";
import { SocketContext } from "./Socket";

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
    const navigate = useNavigate();
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
                console.log(response.user);
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
                    console.log("socket.on game.create success " + response.msg);
                    navigate('/game');
                }
            }
        })

        socket.on("accept_invite_game_user", response => {
            console.log("socket.on accept game invite " + response.success + " " + response.msg);
        })

        return () => {
            socket.off("get_user");
            socket.off("friend_request");
            socket.off("accept_friend_request");
            socket.off("un_friend");
            socket.off("game.create");
            socket.off("accept_invite_game_user");
        }
    }, [])

    // check for game invites, update listener when user updates
    useEffect(() => {
        socket.on("invite_game_user", response => {
            if (response.success && response.request_user_id == cookies.userID) {
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

    }, [user])

    const toggleProfile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("myDropdown")?.classList.toggle("show");
    };

    const handleAccept = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index : number, inviteId : number) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "accept_invite_game_user", 
            data: {user_id: cookies.userID, request_user_id: inviteId}
        })
        console.log(`emiting accept_invite_game_user`);
        setGameInvites(gameInvites => gameInvites.filter((_, i) => i !== index));
        document.getElementById("myDropdown")?.classList.toggle("show");
    }

    const handleDecline = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index : number) => {
        e.preventDefault();
        setGameInvites(gameInvites => gameInvites.filter((_, i) => i !== index));
    }

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
                                <button className="friendslistButton" onClick={(e) => handleAccept(e, index, element.fromUserId)}>Accept</button>
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