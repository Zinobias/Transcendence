import React from "react";
import { Outlet, Link } from 'react-router-dom';
import '../App.css'

const NavBar: React.FC = () => {
    return (
        <div className="app">   
        <span className="heading">Disco Pong</span>      
        <div id="nav">
            <ul>
              <li><Link to='/discopong/game'>Game</Link></li>
              <li><Link to='/discopong/leaderboard'>Leaderboard</Link></li>
              <li><Link to='/discopong/chat'>Chat</Link></li>
            </ul>
          </div>   
            <Outlet />
        </div>
      );
}

export default NavBar;