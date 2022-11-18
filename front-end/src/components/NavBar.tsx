import React from "react";
import { Outlet, Link } from 'react-router-dom';
import { LogoutButton } from './Buttons';
import ProfileNav from "./ProfileNav";
import FooterChat from "./FooterChat";
import '../App.css'

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/

const NavBar: React.FC = () => {
    return (
        <>
            <div className="grid-container">
                    <LogoutButton />
                <ProfileNav />
                <div id="nav">
                    <ul>
                        <li><Link to='/game'>Game</Link></li>
                        <li><Link to='/leaderboard'>Leaderboard</Link></li>
                        <li><Link to='/chat'>Chat</Link></li>
                    </ul>
                </div>   
                <div className="grid__body">
                    <Outlet />
                </div>
                <FooterChat />
            </div>
        </>
    );
}

export default NavBar;