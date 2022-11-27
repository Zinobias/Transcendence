import React, { useState, useRef, useEffect }  from "react";
import { Link } from 'react-router-dom';
import { AiFillCloseSquare } from "react-icons/ai";
import Friendslist from "./Friendslist";
import { useCookies } from 'react-cookie';
import '../App.css'

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/

const ProfileNav: React.FC = () => {
    const [cookies, setCookie] = useCookies(['user', 'userID']);
    var path:string = "/profile?id=" + cookies.userID; 

    const handleClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("myDropdown")?.classList.toggle("show");
    };

    const   handleClose = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("myDropdown")?.classList.toggle("show");
    }

    return (
        <div id="myProfile" className="profile">
            <img
                src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
                alt="defaultAvatar"
                className="profile__avatar"
                onClick={(e) => handleClick(e)}
            />
            <div id="myDropdown" className="profile__dropdown">
                <span className="profile__close" onClick={(e) => handleClose(e)}>
                    <AiFillCloseSquare />
                </span>
                <p style={{textAlign: "left"}}><Link to={path}>My Profile</Link></p>
                <Friendslist />
            </div>
        </div>
      );
}

export default ProfileNav;