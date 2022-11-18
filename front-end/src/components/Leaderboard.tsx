import React from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

const   Leaderboard: React.FC = () => {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['user', 'userID']);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        console.log("test click");
        navigate({
            pathname: '/profile',
            search: 'id=' + cookies.userID,
        })
    }

    return (
        <div>
            Leaderboard
            {/* <button className="defaultButton" onClick={(e) => handleClick(e)}>X</button> */}
        </div>
    )
};

export default Leaderboard;