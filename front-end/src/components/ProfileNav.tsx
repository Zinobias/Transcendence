import React from "react";
import '../App.css'

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/


const ProfileNav: React.FC = () => {

    const handleClick = () => {

    };

    return (
        <>
        <img
            src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
            alt="defaultAvatar"
            className="avatar"
        />
        </>
      );
}

export default ProfileNav;