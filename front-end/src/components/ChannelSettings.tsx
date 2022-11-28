import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { IChannel, SettingType } from '../interfaces';
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

    const handleProfile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>,  userId: number) => {
        e.preventDefault();
        navigate({
            pathname: '/profile',
            search: 'id=' + userId,
        })
    }

    function findAdmin (userId : number) : boolean {
		const res = channel?.settings.find((e) => userId == e.userId && e.setting == SettingType.ADMIN);
		return (res !== undefined);
	}
	
	const toggleSettings = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, userId: number) => {
		e.preventDefault();
		console.log("settings click");
		document.getElementById(userId.toString())?.classList.toggle("settingsShow");
	}; 

	/*
		TO DO:
		SETTINGS:
		- Leave channel button
		- if owner:
			show password stuff on top
		- member list:
			- Member Settings:
			- Go to Profile
			- Invite to Game
			- if Admin/Owner:
				Mute/Ban
	*/

	if (channelId == undefined) {
		return (<></>)
	}
    return (
        <div className="channelSettings">
            <button className="leaveChannel" onClick={(e) => handleLeave(e)}>LEAVE</button>
			{
				cookies.userID == channel?.owner &&
				<button className="leaveChannel">pw</button>
			}
            MEMBERS:
            {channel?.users.map((element, index) => (
                <li key={index} className="listMembers">
                    <span onClick={(e) => toggleSettings(e, element.userId)}>
					{element.name} 
                    {
                        element.userId == channel.owner &&
                        <TbCrown />
                    }
					</span>
					<div id={element.userId.toString()} className="settingsDropdown">
						<button className="leaveChannel" onClick={(e) => handleProfile(e, element.userId)}>profile</button>
					</div>
                </li>
            ))}
        </div>
    )
}

export default ChannelSettings