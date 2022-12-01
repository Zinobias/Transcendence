import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { IChannel, SettingType } from '../interfaces';
import { SocketContext } from './Socket';
import { TbCrown } from "react-icons/tb";
import { BsGear } from "react-icons/bs";
import ChannelUtils from './ChannelUtils';

interface Props {
    channel: IChannel | undefined;
}

const ChannelSettings : React.FC<Props> = ({channel}) => {
    const [cookies] = useCookies(['userID', 'user']);
    const socket = useContext(SocketContext);

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
          userId: cookies.userID,
          authToken: cookies.user,
          eventPattern: "channel_leave",
          data: {user_id: cookies.userID, channel_id: channel?.channelId}
        })
        console.log("emiting channel_leave");
        document.getElementById("chatSettings")?.classList.toggle("footerChat__show");
    }
	
	const toggleSettings = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, userId: number) => {
		e.preventDefault();
		console.log("settings click");
		document.getElementById(userId.toString())?.classList.toggle("settingsShow");
	}; 

    
    function findAdmin (userId : number) : boolean {
        if (userId == channel?.owner) 
            return (false);
        const res = channel?.settings.find((e) => userId == e.userId && e.setting == SettingType.ADMIN);
        return (res !== undefined);
    }

	if (channel == undefined) {
		return (<></>)
	}

    return (
        <div>
            {
                channel?.otherOwner == undefined &&
                <button className="settingsButton" onClick={(e) => handleLeave(e)}>LEAVE</button>
            }
			{
				channel?.otherOwner == undefined && cookies.userID == channel?.owner &&
				<button className="settingsButton">PW</button>
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
                    {
                        findAdmin(element.userId) &&
                        <BsGear />
                    }
					</span>
					<div id={element.userId.toString()} className="settingsDropdown">
                        <ChannelUtils channel={channel} memberUserID={element.userId}/>
					</div>
                </li>
            ))}
        </div>
    )
}

export default ChannelSettings