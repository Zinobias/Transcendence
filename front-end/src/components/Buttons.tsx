
import React from "react";
import { useCookies } from 'react-cookie';

const   LogoutButton: React.FC = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user', 'userID']);

    const handleLogout = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        removeCookie('user');
        removeCookie('userID')
        console.log("click logout");
    };

    return (
        <div>
            <button className="loginform__button" onClick={(e) => handleLogout(e)}>LOGOUT</button>
        </div>
    )
};

export default LogoutButton; 
