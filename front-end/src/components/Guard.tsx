
import React from "react";
import { Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

export interface GuardProps {
    outlet: React.ReactElement;
}

const Guard: React.FC<GuardProps> = ({outlet}) => {
    const [cookies] = useCookies(['user']);

    if (cookies.user)
        return outlet;
    return  <Navigate to='/login' />;
};

export default Guard;