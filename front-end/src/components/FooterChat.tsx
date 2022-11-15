import React from 'react'
import { AiOutlineClose } from 'react-icons/ai';
import { SlBubble } from 'react-icons/sl';
import ChatWindow from './ChatWindow';

const FooterChat: React.FC = () => {

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
            {/* <ChatWindow /> */}
            CHAT PLACEHOLDER
        </div>
    </div>   
    )
}

export default FooterChat;