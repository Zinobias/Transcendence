import React from "react";
import { AccountButton } from "./Buttons";

const SignUp: React.FC = () => {


    return (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__body">
                <AccountButton/>
            </div>
        </div>
    )
};

export default SignUp;