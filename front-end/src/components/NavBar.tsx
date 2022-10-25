import React from "react";
import { Outlet, Link } from 'react-router-dom';
import '../App.css'

/*
    An <Outlet> should be used in parent route elements to render their child route elements. 
    This allows nested UI to show up when child routes are rendered. If the parent route matched exactly
*/

const NavBar: React.FC = () => {
    return (
        <div className="grid-container">

          {/* <div className="grid-item">    */}
          <span className="grid__header">Disco Pong</span>      
          <div id="nav">
              <ul>
                <li><Link to='/discopong/game'>Game</Link></li>
                <li><Link to='/discopong/leaderboard'>Leaderboard</Link></li>
                <li><Link to='/discopong/chat'>Chat</Link></li>
              </ul>
            </div>   
            <div className="grid__left">left</div>
            <div className="grid__right">right</div>
            <div className="grid__body">
              <Outlet />
            </div>
          {/* </div> */}
        </div>
      );
}

export default NavBar;