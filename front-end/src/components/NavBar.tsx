import React from "react";
import { Outlet, Link } from 'react-router-dom';
import { LogoutButton } from './Buttons';
import ProfileNav from "./ProfileNav";
import '../App.css'
import Friendslist from "./Friendslist";
import FooterChat from "./FooterChat";

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/

const NavBar: React.FC = () => {
    return (

        <>
        <div className="grid-container">

          {/* <div className="grid-item">    */}
          {/* <span className="grid__header">Disco Pong</span>       */}
          <div id="nav">
              <ul>
                <li><Link to='/game'>Game</Link></li>
                <li><Link to='/leaderboard'>Leaderboard</Link></li>
                <li><Link to='/chat'>Chat</Link></li>
              </ul>
            </div>   
            <div className="grid__left">
              {/* <ProfileNav /> */}
              <LogoutButton />
            </div>
            <div className="grid__right">
              <ProfileNav />
              <Friendslist />
              {/* <LogoutButton /> */}
            </div>
            <div className="grid__body">
              <Outlet />
            </div>
          {/* </div> */}
            <FooterChat />
        </div>
        
        </>
      );
}

export default NavBar;