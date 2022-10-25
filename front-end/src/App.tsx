import React, { ReactNode, useState, useEffect, useContext } from 'react';
import './App.css';
import { SocketContext } from './components/Socket';
import Routing from './components/Routing';

import { useCookies } from 'react-cookie';

const App: React.FC = () => {

  const socket = useContext(SocketContext);

  //strict mode makes useEffect fire twice in developer mode
  useEffect(() => {
	  socket.on("msgToClient", data => {
		  console.log(data + "client");
	  });
  }, [])

  return (
    <SocketContext.Provider value={socket}>
        <Routing />    
    </SocketContext.Provider>
  );


  // const [name, setName] = useState<string>("");
  // const [cookies, setCookie] = useCookies(['name']);

  // const handleClick = () => {
  //   setCookie('name', name, { path: '/' });
  // }

  // return (
  //   <div className="app">
  //     <h1>Name of the user:</h1>
  //     <input
  //       placeholder="name"
  //       value={name}
  //       onChange={(e) => setName(e.target.value)}
  //     />
  //     <div>
  //       <button onClick={handleClick}>Set Cookie</button>
  //     </div>
  //     <br />
  //     {cookies.name && (
  //     <div>
  //        Name: <p>{cookies.name}</p>
  //     </div>
  //     )}
  //   </div>
  // );

}

export default App;
