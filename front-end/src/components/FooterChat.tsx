import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { SlBubble } from 'react-icons/sl';
import { IChannel } from '../interfaces';
import ChannelSettings from './ChannelSettings';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { SocketContext } from './Socket';

const FooterChat: React.FC = () => {

    const [channelId, setChannelId] = useState<number>();
    const [channel, setChannel] = useState<IChannel>();
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);

    useEffect(() => {
        socket.on("channel_retrieve_by_id", response => {
            console.log(`socket.on channel_retrieve_by_id settings ${response.channel.channelName}`)
            setChannel(channel => response.channel);
        })

        return () => {
            socket.off("channel_retrieve_by_id");
        }
    }, [])

    useEffect(() => {
        if (channelId != undefined) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_retrieve_by_id", 
                data: { user_id: cookies.userID, 
                        channel_id: channelId }
            });
            console.log(`socket.emit channel_retrieve_by_id ${channelId}`);
        }
    }, [channelId])

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
                <ChatWindow channel={channel}/>
            </div>
            <div id="chatSettings" className="footerChat__settings">
                <ChannelSettings channel={channel}/>
            </div>
        </div>
    </div>   
    )
}

export default FooterChat;