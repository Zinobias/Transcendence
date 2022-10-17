import React from "react";
import { Link} from 'react-router-dom';
import LinkButton from './Routing';

const Landing: React.FC = () => {
    return (
        <>  
          <div className='app'>
          <div id="nav">
            <ul>
              <li><Link to='/game'>Game</Link></li>
              <li><Link to='/profile'>Profile</Link></li>
              <li><Link to='/chat'>Chat</Link></li>
            </ul>
          </div>
            <LinkButton />       
          </div>   
        </>
      );
}

export default Landing;