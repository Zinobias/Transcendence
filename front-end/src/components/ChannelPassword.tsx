import React, { useContext, useState } from 'react'
import { SocketContext } from './Socket';

interface Props {
    channelName: string | undefined;
    channelId: number | undefined;
}

const ChannelPassword : React.FC<Props> = ({channelName, channelId}) => {
    const socket = useContext(SocketContext);
    const [pw, setPw] = useState<string>();

    const handlePassword = (e: React.FormEvent) => {
        //TODO implement has for password, below is an example of how to hash something, just append the channel id to the end of the password
        //console.log(Md5.hashStr(chatroomPassword + chatroomId))
        e.preventDefault();
        console.log(`emitting channel_update_password`);
    };

    return (
        <>
            <form className="loginform" id="newPw">
            <label className="loginform__label">Enter PW for {channelName}</label>
            <input type="input" value={pw} onChange={(e)=>setPw(e.target.value)} className="loginform__input"/>
            <button className="loginform__button" onClick={(e) => handlePassword(e)}>SUBMIT</button>
            </form>
        </>
    )
}

export default ChannelPassword