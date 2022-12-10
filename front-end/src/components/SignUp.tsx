import React from "react";
import { SignupButton } from "./LoginUtils";

const SignUp: React.FC = () => {


    return (
        <div className="grid-container">
            <span className="grid__header">Disco Pong</span>      
            <div className="grid__body">
                <SignupButton />
            </div>
        </div>
    )
};

export default SignUp;