import React, { ReactNode, useState, useEffect, useContext } from 'react';
import './App.css';
import { AuthSocketContext } from './components/Socket';
import Routing from './components/Routing';

// import { useCookies } from 'react-cookie';

const App: React.FC = () => {

  const socket = useContext(AuthSocketContext);

  //strict mode makes useEffect fire twice in developer mode
  useEffect(() => {
	  socket.on("wssTest", message => {
		  console.log(message.message + "client");
	  });
  }, []) //only re-run the effect if new message comes in

  return (
    <AuthSocketContext.Provider value={socket}>
        <Routing />    
    </AuthSocketContext.Provider>
  );

}

export default App;
