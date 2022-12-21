import React from "react";
import { LoginButton } from "./LoginUtils";
import '../App.css'
import './Components.css';

const   Login: React.FC = () => {

    return  (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__body">
                <LoginButton/>
            </div>
        </div>
      )
};

export default Login;