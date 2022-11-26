import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { IChannel } from '../interfaces';
import { SocketContext } from './Socket';
import { TbCrown } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

interface Props {
    channelId: number | undefined;
}

const ChannelSettings : React.FC<Props> = ({channelId}) => {
    const [channel, setChannel] = useState<IChannel>();
    const [cookies] = useCookies(['userID', 'user']);
    const navigate = useNavigate();
    const socket = useContext(SocketContext);

    // EVENT LISTENERS (all the channel_retrieve emits are happening in ChatWindow)
    useEffect(() => {
        socket.on("channel_retrieve_by_id", response => {
            console.log(`socket.on channel_retrieve_by_id ${response.channel.channelName}`)
            setChannel(channel => response.channel);
        })

        return () => {
            socket.off("channel_retrieve_by_id");
        }
    }, [])

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
          userId: cookies.userID,
          authToken: cookies.user,
          eventPattern: "channel_leave",
          data: {user_id: cookies.userID, channel_id: channelId}
        })
        console.log("emiting channel_leave");
        document.getElementById("chatSettings")?.classList.toggle("footerChat__show");
    }

    const handleProfile = (e: React.MouseEvent<HTMLLIElement, MouseEvent>,  userId: number) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + userId,
        })
    }

    return (
        <div className="channelSettings">
            {
                channelId != undefined &&    
                <button className="leaveChannel" onClick={(e) => handleLeave(e)}>LEAVE</button>
            }
            MEMBERS:
            {channel?.users.map((element, index) => (
                <li key={index} className="listMembers" onClick={(e) => handleProfile(e, element.userId)}>
                    {element.name} 
                    {
                        element.userId === channel.owner &&
                        <TbCrown />
                    }
                </li>
            ))}
        </div>
    )
}

export default ChannelSettings