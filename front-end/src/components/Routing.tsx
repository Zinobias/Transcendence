
import React from 'react'
import { Routes, Route } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Login from './Login';
import Chat from './Chat'
import Leaderboard from './Leaderboard';
import Game from './Game'
import ChatWindow from './ChatWindow';
import NavBar from './NavBar';
import SignUp from './SignUp';
import Guard  from './Guard';

const Routing: React.FC  = () => {
    const [cookies] = useCookies(['user']);

    return (
        // STILL NEED TO WRITE PROPER GUARD
        <Routes>
            {/* <Route path='/Login' element={cookies.user ? <NavBar /> : <Login />}/> */}
            <Route path='/Login' element={<Login />}/>
            {/* <Route path='/SignUp' element={<SignUp />}/> */}
            <Route path='/' element={<Guard outlet={<NavBar />} />}>
            {/* <Route path='/' element={!cookies.user ? <Login /> : <NavBar />}> */}
                <Route index element={<Leaderboard />} />
                <Route path='leaderboard' element={<Leaderboard />} />
                <Route path='game' element={<Game />} />
                <Route path='chat' element={<Chat />} />
                <Route path='chat/chat_window' element={<ChatWindow />} />
            </Route>

        </Routes>
    )
};

export default Routing;