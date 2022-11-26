import React, { useState } from 'react'
import { SlBubble } from 'react-icons/sl';
import ChannelSettings from './ChannelSettings';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

const FooterChat: React.FC = () => {

    const [channelId, setChannelId] = useState<number>();

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        console.log("footer click");
        document.getElementById("footerDropdown")?.classList.toggle("footerChat__show");
    };

    return (
    <div className='footerChat'>
        <div className='footerChat__icon' onClick={(e) => handleClick(e)}>
            <SlBubble />
        </div>
        <div id="footerDropdown" className='footerChat__body'>

            <div className='footerChat__sidebar'>
                <ChatSidebar channelId={channelId} setChannelId={setChannelId} />
            </div>
            <div className='footerChat__chat'>
                <ChatWindow channelId={channelId}/>
            </div>
            <div id="chatSettings" className="footerChat__settings">
                <ChannelSettings channelId={channelId}/>
            </div>
        </div>
    </div>   
    )
}

export default FooterChat;