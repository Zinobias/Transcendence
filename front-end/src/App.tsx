import React, { ReactNode, useState, useEffect, useContext } from 'react';
import './App.css';
import { SocketContext } from './components/Socket';
import Routing from './components/Routing';

// import { useCookies } from 'react-cookie';

const App: React.FC = () => {

  const socket = useContext(SocketContext);

  //strict mode makes useEffect fire twice in developer mode
  useEffect(() => {
	  // socket.on("wssTest", message => {
		//   console.log(message.message + "client");
	  // });
	  socket.emit('game', { msg : "dsssss"});
  }, []) //only re-run the effect if new message comes in

  return (
    <SocketContext.Provider value={socket}>
        <Routing />    
    </SocketContext.Provider>
  );

}

export default App;
