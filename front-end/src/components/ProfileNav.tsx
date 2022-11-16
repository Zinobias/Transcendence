import React, { useState, useRef, useEffect }  from "react";
// import LogoutButton from './Buttons';
import '../App.css'
import { AiFillCloseSquare } from "react-icons/ai";

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/

const ProfileNav: React.FC = () => {

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
                <p>My Profile</p>
                <p>Change Avatar</p>
                <p>2 Factor Authentication</p>
            </div>
        </div>
      );
}

export default ProfileNav;