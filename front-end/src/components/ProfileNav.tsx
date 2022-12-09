import React, { useState, useRef, useEffect, useContext }  from "react";
import { Link } from 'react-router-dom';
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

const ProfileNav: React.FC = () => {
    const [user, setUser] = useState<IUser>();
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    const [state, setState] = useState<boolean>(false);
    var path:string = "/profile?id=" + cookies.userID; 
    const socket = useContext(SocketContext);

    // emit to get user on mount and state change to update it
    useEffect(() => {
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_user", 
            data: {user_id: cookies.userID, requested_user_id: cookies.userID}
        })
        console.log(`emiting get_user ${cookies.userID}`);
    }, [state])

    // user event listeners
    useEffect(() => {
        socket.on("get_user", response => {
            if (response.success && response.user.userId == cookies.userID) {
                console.log("get_user success profileNav");
                setUser(user => response.user);
            }
        })

        socket.on("friend_request", response => {
            if (response.success) {
                console.log(`socket.on friend_request success from ${response.user} to ${response.friend}`);
                if (response.friend === cookies.userID) {
                    setState(state => !state);
                    document.getElementById("myDropdown")?.classList.toggle("show");
                }
            }
            else
                console.log(`socket.on friend_request fail ${response.msg}`);
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

        return () => {
            socket.off("get_user");
            socket.off("friend_request");
            socket.off("accept_friend_request");
            socket.off("un_friend");
        }
    }, [])

    const handleClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("myDropdown")?.classList.toggle("show");
    };

    const   handleClose = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("myDropdown")?.classList.toggle("show");
    }

    return (
        <div className="profileNav">
            <img
                src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
                alt="defaultAvatar"
                className="profileNav__avatar"
                onClick={(e) => handleClick(e)}
            />
            <div id="myDropdown" className="profileNav__dropdown">
                {/* <span className="profile__close" onClick={(e) => handleClose(e)}>
                    <AiFillCloseSquare />
                </span> */}
                <p><Link to={path}>My Profile</Link></p>
                {
                    user &&
                    <Friendslist user={user}/>
                }
            </div>
        </div>
      );
}

export default ProfileNav;