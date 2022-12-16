
import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Login from './Login';
import Chat from './Chat'
import Leaderboard from './Leaderboard';
import Game from './Game'
import NavBar from './NavBar';
import SignUp from './SignUp';
import Guard  from './Guard';
import Profile from './Profile';
import { socket } from './Socket';

const Routing: React.FC  = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user', 'userID']);

    return (
        <Routes>
            {/* <Route path='/Login' element={cookies.user ? <NavBar /> : <Login />}/> */}
            <Route path='/login' element={<Login />}/>
            <Route path='/signup' element={<SignUp />}/>
            <Route path='/' element={<Guard outlet={<NavBar />} />}>
                <Route index element={<Game />} />
                <Route path='leaderboard' element={<Leaderboard />} />
                <Route path='game' element={<Game />} />
                <Route path='chat' element={<Chat />} />
                <Route path='profile' element={<Profile/>}/>
            </Route>
        </Routes>
    )
};

export default Routing;