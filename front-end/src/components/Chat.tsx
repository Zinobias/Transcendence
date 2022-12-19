import React, {  useContext, useState,  useEffect } from "react";
import { useCookies } from 'react-cookie';
import { SocketContext } from './Socket';
import { IChannelInfo } from "../interfaces"
import './Components.css';
import {Md5} from "ts-md5";
import ListPublicChatrooms from "./ListPublicChatrooms";

const   Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [state, setState] = useState<boolean>(false);
    const [chatroomName, setChatroomName] = useState<string>("");
    const [visibleCheck, setVisibleCheck] = useState<boolean>(false);
    const [passwordCheck, setPasswordCheck] = useState<boolean>(false);
    const [channels, setChannels] = useState<IChannelInfo[]>([]);
    const [pw, setPw] = useState<string>("");
    const [pwName, setPwName] = useState<string>("");
    const [pwId, setPwId] = useState<number>(-1);

    // update channels on state change
    useEffect(() => {
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channels_retrieve",
            data: {user_id: cookies.userID}
        })
        // console.log("emiting channels_retrieve");
    }, [state])

    useEffect(() => {
        const interval = setInterval(() => {
            // console.log('This will run every second!');
            setState( state => !state);
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    
    // event listeners
    useEffect(() => {
        socket.on("channel_create", response => {
            if (response.success == true && response.hasPassword == false) {
                console.log(`socket.on channel_create success ${response.channel_name}`);
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "get_channels_user",
                    data: {user_id: cookies.userID}
                })
                // if (document.getElementById("footerDropdown")?.classList.contains("footerChat__show") == false)
                //     document.getElementById("footerDropdown")?.classList.toggle("footerChat__show");
                console.log("emiting get_channels_user");
                setState( state => !state);
            }
            else if (response.success == true && response.hasPassword == true) {
                document.getElementById("pwChannel")?.classList.toggle("FormShow");
                document.getElementById("noPwChannel")?.classList.toggle("FormHide");
                setPwName( pwName => response.channel_name);
                setPwId( pwId => response.channel_id);
            }
            else
            alert(`[${response.msg}]`);
        })
        
        socket.on("channels_retrieve", response  => {
            // console.log(`socket.on channels_retrieve success`);
            setChannels([]);
            response.channels.forEach((element : IChannelInfo) => {
                setChannels( channels => [...channels, element])
            });
        })
        
        socket.on("channel_update_password", updatePasswordInChat)
        
        return () => {
            socket.off("channel_create");
            socket.off("channels_retrieve");
            socket.off("channel_update_password", updatePasswordInChat);
        }
    },[])

    // event listener functions
    function updatePasswordInChat (response : any) {
        if (response.success == true) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "get_channels_user",
                data: {user_id: cookies.userID}
            })
            console.log("emiting get_channels_user");
            setState( state => !state);
            setPwName("");
            setPwId(-1);
            document.getElementById("pwChannel")?.classList.toggle("FormHide");
            document.getElementById("noPwChannel")?.classList.toggle("FormShow");
        }
        else
            alert(`[${response.msg}]`);
    }

    function validateChatroomName (name: string) : boolean {
        const regExp = new RegExp(`[^a-zA-Z0-9_]`, 'g');
        const match = name.matchAll(regExp);
        const result = match.next().value;

        if (!name) {
            alert("Name Field is required");
            return (false);
        }
        if (name.length > 12 || name.length < 3) {
            alert("Channel Name needs to be between 3-12 characters");
            return (false);
        }
        if (result != undefined) {
            alert(`[${result}] is an invalid character`);
            return (false);
        }
        return (true);
    }

    function validatePassword (name: string) : boolean {
        if (!name) {
            alert("Password is required");
            return (false);
        }
        if (name.length > 16 || name.length < 8) {
            alert("Channel password needs to be between 8-16 characters");
            return (false);
        }
        return (true);
    }

    const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
        if (validateChatroomName(chatroomName)) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_create", 
                data: { user_id: cookies.userID, 
                        channel_name: chatroomName, 
                        creator2_id: undefined, 
                        visible: visibleCheck, 
                        should_get_password: passwordCheck }
            });
            console.log(`emiting channel_create name:[${chatroomName}] visible:[${visibleCheck}] password:[${passwordCheck}]`);
        }
        setChatroomName("");
        setVisibleCheck(false);
        setPasswordCheck(false);
    };

    const handlePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePassword(pw)) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "channel_update_password", 
                data: { user_id: cookies.userID, 
                        channel_id: pwId, 
                        password: Md5.hashStr(pw + pwId) }
            });
            console.log(`emitting channel_update_password [${Md5.hashStr(pw + pwId)}]`);
            setPw("");
            document.getElementById("Channel")?.classList.toggle("channelShow");
            document.getElementById("pwChannel")?.classList.toggle("pwChannelShow");
        }

    };

    return (
        <>
        <div>
            <span className="heading__small">PUBLIC CHATROOMS</span>
            <ListPublicChatrooms chatroom={channels} />
        </div>
        <div className="newPwChannel" id="pwChannel">
            <form className="loginform">
                <label className="loginform__label">Enter password for {pwName}</label>
                <input type="input" value={pw} onChange={(e)=>setPw(e.target.value)} className="loginform__input"/>
                <button className="loginform__button" onClick={(e) => handlePassword(e)}>SUBMIT</button>
            </form> 
        </div>
        <div className="newChannel" id="Channel">
            <form className="loginform">
                    <label className="loginform__label">Name</label>
                    <input type="input" value={chatroomName} onChange={(e)=>setChatroomName(e.target.value)} className="loginform__input"/>
                    <label className="loginform__label">password</label>
                    <input type="checkbox" checked={passwordCheck} onChange={e => setPasswordCheck(!passwordCheck)}/>
                    <label className="loginform__label">public</label>
                    <input type="checkbox" checked={visibleCheck} onChange={e => setVisibleCheck(!visibleCheck)}/>
                    <button className="loginform__button" onClick={(e) => handleSubmit(e)}>NEW CHATROOM</button>
            </form>
        </div>
        </>
    )
    
};

export default Chat;
