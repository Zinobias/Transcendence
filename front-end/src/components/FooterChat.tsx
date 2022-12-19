import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { SlBubble } from 'react-icons/sl';
import { IChannel } from '../interfaces';
import ChannelSettings from './ChannelSettings';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { SocketContext } from './Socket';

const FooterChat: React.FC = () => {

    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [channelId, setChannelId] = useState<number>();
    const [channel, setChannel] = useState<IChannel>();
    const [updateChannel, setUpdateChannel] = useState<boolean>(false);

    // event listener
    useEffect(() => {
        socket.on("channel_retrieve_by_id", response => {
            console.log(`socket.on channel_retrieve_by_id ${response.channel.channelName} ${response.channel.channelId}`)
            setChannel(channel => response.channel);
        })

        return () => {
            socket.off("channel_retrieve_by_id");
        }
    }, [])

    // when channelId or updateChannel changes we emit to update the channel
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
    }, [channelId, updateChannel])

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("footerDropdown")?.classList.toggle("footerChat__show");
    };

    return (
    <div className='footerChat'>
        <div className='footerChat__icon' onClick={(e) => handleClick(e)}>
            <SlBubble />
        </div>
        <div id="footerDropdown" className='footerChat__body'>
            <div className='footerChat__sidebar'>
                <ChatSidebar channelId={channelId} setChannelId={setChannelId} channel={channel} setChannel={setChannel}/>
            </div>
            <div className='footerChat__chat'>
                {
                    channel ?
                    <ChatWindow channel={channel} updateChannel={updateChannel} setUpdateChannel={setUpdateChannel}/> :
                    <div className="chatroom">
                        No Chatroom loaded
                    </div>
                }
            </div>
            <div id="chatSettings" className="footerChat__settings">
                {
                    channel &&
                    <ChannelSettings channel={channel}/>
                }
            </div>
        </div>
    </div>   
    )
}

export default FooterChat;