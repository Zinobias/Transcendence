import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { IChannel, SettingType } from '../interfaces';
import { SocketContext } from './Socket';
import { TbCrown, TbSword } from "react-icons/tb";
import {Md5} from "ts-md5";
import ChannelUtils from './ChannelUtils';

interface Props {
    channel: IChannel | undefined;
}

const ChannelSettings : React.FC<Props> = ({channel}) => {
    const [cookies] = useCookies(['userID', 'user']);
    const [pw, setPw] = useState<string>("");
    const socket = useContext(SocketContext);

    // EVENT LISTENER
    socket.on("channel_update_password", response => {
        if (response.success == true && response.channel_id == channel?.channelId ) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_retrieve_by_id", 
                data: { user_id: cookies.userID, 
                        channel_id: channel?.channelId }
            });
            console.log("emiting channel_retrieve_by_id");
        }
        return () => {
            socket.off("channel_update_password");
        }
    })

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
		document.getElementById(userId.toString())?.classList.toggle("settingsShow");
	}; 

    const setPassword = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        document.getElementById("settingsPasswordDropDown")?.classList.toggle("settingsPasswordShow");
        document.getElementById("passwordSetButton")?.classList.toggle("settingsPasswordHide");
    }
 
    const submitPassword = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (validatePassword(pw)) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_update_password", 
                data: {user_id: cookies.userID, channel_id: channel?.channelId, password: Md5.hashStr(pw + channel?.channelId)}
            });
            console.log(`emitting channel_update_password`);
            setPw("");
            document.getElementById("settingsPasswordDropDown")?.classList.toggle("settingsPasswordShow");
            document.getElementById("passwordSetButton")?.classList.toggle("settingsPasswordHide");
        }
    }

    const removePassword = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_update_password", 
            data: {user_id: cookies.userID, channel_id: channel?.channelId, password: undefined}
        });
        console.log(`emitting channel_update_password`);
    }

    function findAdmin (userId : number) : boolean {
        if (userId == channel?.owner) 
            return (false);
        const res = channel?.settings.find((e) => userId == e.userId && e.setting == SettingType.ADMIN);
        return (res !== undefined);
    }

    function validatePassword (password: string) : boolean {
        if (!password) {
            alert("Password is required");
            return (false);
        }
        if (password.length > 16 || password.length < 8) {
            alert("Channel password needs to be between 8-16 characters");
            return (false);
        }
        return (true);
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
                <>
                {
                    channel.password == undefined ?
                    <div className='settingsPasswordToggle' id="passwordSetButton"><button className="settingsButton" onClick={(e) => setPassword(e)}>set pw</button></div>:
                    <>
                    <button className="settingsButton" onClick={(e) => removePassword(e)}>remove pw</button>
                    <div className='settingsPasswordToggle' id="passwordSetButton"><button className="settingsButton" onClick={(e) => setPassword(e)}>change pw</button></div>
                    </>

                }
                </>
			}
            <div className="settingsPassword" id="settingsPasswordDropDown">
                <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} className="settingsInput"/>
                <button className="settingsButton" onClick={(e) => submitPassword(e)}>submit new pw</button>
            </div>
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
                        <TbSword />
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