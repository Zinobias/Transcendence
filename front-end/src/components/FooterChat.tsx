import React, { useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai';
import { SlBubble } from 'react-icons/sl';
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
                {/* 
                    CHAT NOTES
                    ChatWindow should get an channelID to know what channel to display
                    ChatSidebar should also get that ID so on click the ID changes and ChatChannel updates
                    if there is no ID just dont display anything 
                */}
                <ChatWindow channelId={channelId}/>
            </div>
            <div id="chatSettings" className="footerChat__settings">
                settings
            </div>
        </div>
    </div>   
    )
}

export default FooterChat;