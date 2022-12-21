import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { IChannelInfo, IUser, SmallUser } from '../interfaces';
import { SocketContext } from './Socket';

interface Props {
    user: IUser;
}

export const UserSettings : React.FC<Props> = ({user}) => {
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [hasTwoFA, setHasTwoFA] = useState<boolean>(false);
    const [qrcode, setQrcode] = useState<string>("");
    const [token, setToken] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<File>();

    // event listeners and emit on mount
    useEffect(() => {
        socket.on("isEnabled_2fa", response => {
            setHasTwoFA(hasTwoFA => response.success);
        }) 

        socket.on("remove_2fa", response => {
            if (response.success) {
                // console.log("socket.on remove_2fa success");
                setHasTwoFA(hasTwoFA => false);
            }
            else
                alert(response.msg);
        })

        socket.on("enable_2fa", response => {
            if (response.success) {
                // console.log("socket.on enable_2fa success");
                setQrcode(response.qrCode);
                // toggle verify menu
                document.getElementById("verify_TwoFA")?.classList.toggle("twoFA_show");
            }
            else
                alert(response.msg);
        })

        socket.on("verify_2fa", response => {
            if (response.success) {
                // console.log("socket.on varify_2fa success");
                setHasTwoFA(hasTwoFA => true);
            }
            else
                alert(response.msg);
        })

        socket.on("update_avatar", response => {
            if (response.success) {
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "get_user", 
                    data: { user_id: cookies.userID, requested_user_id: cookies.userID }
                })
            }
        }) 

        socket.emit("isEnabled_2fa", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "isEnabled_2fa", 
            data: {user_id: cookies.userID}
        });

        return () => {
            socket.off("isEnabled_2fa");
            socket.off("verify_2fa");
            socket.off("enable_2fa");
            socket.off("remove_2fa");
            socket.off("update_avatar");
        }
    }, [])

    // emit update avatar when selectedImages changes 
    useEffect(() => {
        if (selectedImage) {
            if (!selectedImage?.name.match(/\.(jpg|jpeg|png)$/)) 
                alert("Please Select a valid image")
            else  {
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "update_avatar", 
                    data: {
                        user_id: cookies.userID,
                        new_avatar: selectedImage as Blob
                    }
                });
                // console.log('emitting update_avatar');   
            }
        }
    }, [selectedImage])

    // ENABLE -> SHOW QR CODE -> VERIFY SUCCES -> hasTwoFA true
    const enableTwoFA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("enable_2fa", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "enable_2fa", 
            data: {user_id: cookies.userID}
        });
        // console.log(`emiting enable_2fa`);
    }

    // VERIFY THE 2FA TOKEN AFTER SCANNING
    const verifyTwoFA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("verify_2fa", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "verify_2fa", 
            data: {TFAToken: token}
        });
        // console.log(`emiting verify_2fa`);
        document.getElementById("verify_TwoFA")?.classList.toggle("twoFA_show");
        setToken("");
        setQrcode("");
    }

    // DISABLE -> USER NEEDS TO ADD HIS ONE TIME TOKEN
    const disableTwoFA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("remove_2fa", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "remove_2fa", 
            data: {TFAToken: token}
        });
        // console.log(`emitting remove_2fa`);
        document.getElementById("disable_TwoFA")?.classList.toggle("twoFA_show")
        setToken("");
    }

    return (
        <>
            <label htmlFor="uploadAvatar_input" className='uploadAvatar'>Update Avatar</label>
            <input
                type="file"
                name="myImage"
                id='uploadAvatar_input'
                className='uploadAvatar_input'
                onChange={(event) => {
                setSelectedImage(event.target.files![0]);
                }}
            />
            {
                hasTwoFA ?
                <button className='profileButton' onClick={() => document.getElementById("disable_TwoFA")?.classList.toggle("twoFA_show")}>disable 2FA</button> :
                <button className='profileButton' onClick={(e) => enableTwoFA(e)}>enable 2FA</button>
            }
            <div className='twoFA' id="verify_TwoFA">
                <img src={qrcode} alt="qrCode" className="profileQR"/>
                <input type="input" value={token} onChange={(e)=> setToken(e.target.value)} className="twoFA_input"/>
                <button className="profileButton" onClick={(e) => verifyTwoFA(e)}>submit 2fa token</button>
            </div>
            <div className='twoFA' id="disable_TwoFA">
                <input type="input" value={token} onChange={(e)=> setToken(e.target.value)} className="twoFA_input"/>
                <button className="profileButton" onClick={(e) => disableTwoFA(e)}>submit 2fa token</button>
            </div>
        </>
    )
}

export const UserFriendSettings : React.FC<Props> = ({user}) => {
    const socket = useContext(SocketContext);
    const [cookies] = useCookies(['userID', 'user']);
    const [channels, setChannels] = useState<IChannelInfo[]>([]);
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);

    
    // event listeners and emits on mount
    useEffect(() => {
        socket.on("get_user", getUserInProfileUtils);
        
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_user", 
            data: { user_id: cookies.userID, requested_user_id: cookies.userID }
        });
        
        socket.on("block_user", response => {
            if (response.success) {
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "get_user", 
                    data: { user_id: cookies.userID, requested_user_id: cookies.userID }
                });
            }
            else 
            // console.log(response.msg);
        })

        socket.on('unblock_user', response => {
            if (response.success) {
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "get_user", 
                    data: { user_id: cookies.userID, requested_user_id: cookies.userID }
                });
            }
            else 
            // console.log(response.msg);
            
        });

        socket.on("get_chatrooms_user", response => {
            setChannels([]);
            response.channels.forEach((element : IChannelInfo) => {
                setChannels(channels => [...channels, element])
            });
        });
        
        socket.on("get_dm_channel", response => {
            if (response.channel != undefined) {
                if (document.getElementById("footerDropdown")?.classList.contains("footerChat__show") == false)
                document.getElementById("footerDropdown")?.classList.toggle("footerChat__show");
                // console.log("already in a dm with that user");
            }
            else {
                socket.emit("chat", {
                    userId: cookies.userID,
                    authToken: cookies.user,
                    eventPattern: "channel_create", 
                    data: { user_id: cookies.userID, 
                            channel_name: `${cookies.userID}_${user.userId}`, 
                            creator2_id: user.userId, 
                            visible: false, 
                            should_get_password: false }
                        });
                        // console.log("not in a dm with that user");
                    }
        });

        socket.on("channel_create", createChannelInProfile);
        
        return () => {
            socket.off("get_user", getUserInProfileUtils);
            socket.off('block_user');
            socket.off('unblock_user');
            socket.off("get_chatrooms_user");
            socket.off("get_dm_channel");
            socket.off("channel_create", createChannelInProfile);
        }
        
    }, [])
    
    // get_user listener function
    function getUserInProfileUtils (response : any) {
        if (response.success && response.user.userId == cookies.userID) {
            setIsBlocked(isBlocked => !response.user.blocked.find((e : SmallUser) => user.userId == e.userId));
            setIsFriend(isFriend => !response.user.friends.find((e : SmallUser) => user.userId == e.userId && e.state == true));
        }
    }

    function createChannelInProfile (response : any) {
        if (response.success == true) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "get_channels_user",
                data: {user_id: cookies.userID}
            })
        }
    }

    const addFriend = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "friend_request",
            data: {user_id: cookies.userID, friend_id: user.userId}
        })
        // console.log(`emitting friend_request`);
    }

    const removeFriend = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "un_friend",
            data: {user_id: cookies.userID, friend_id: user.userId}
        })
        // console.log(`emitting un_friend`);
    }

    const blockUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "block_user",
            data: {user_id: cookies.userID, blocked_id: user.userId}
        })
        // console.log(`emitting block_user`);
    }

    const unblockUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "unblock_user",
            data: {user_id: cookies.userID, blocked_id: user.userId}
        })
        // console.log(`emitting unblock_user`);
    }

    const gameInvite = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, gameMode : string) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "invite_game_user",
            data: {user_id: cookies.userID, request_user_id: user.userId, game_mode: gameMode}
        })
        // console.log(`emitting invite_game_user`);
    }

    const directMessage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // emit to create dm, if we already are in a dm just toggle the chat window       
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_dm_channel",
            data: {user_id: cookies.userID, other_user_id: user.userId}
        })
        // console.log(`emitting get_dm_channel`)
    }

    const channelRequest = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // emit to create dm, if we already are in a dm just toggle the chat window       
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "get_chatrooms_user",
            data: {user_id: cookies.userID}
        })
        // console.log(`emitting to get_chatrooms_user`);
    }

    const channelInvite = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, channelId : number) => {
        // emit to create dm, if we already are in a dm just toggle the chat window       
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "channel_invite",
            data: {user_id: cookies.userID, invited_id: user.userId, channel_id: channelId}
        })
        setChannels(channels => []);
        // console.log(`emitting to channel_invite`);
    }


    return (
        <>  
            <span style={{display: "flex", alignItems: "center", flexDirection: "column", fontWeight: "bold", fontSize: "100%"}}>invite to game</span>
            <button style={{width: "50%", borderRight: "none"}} className='profileButton' onClick={(e) => gameInvite(e, "DEFAULT")}>Default</button>
            <button style={{width: "50%"}} className='profileButton' onClick={(e) => gameInvite(e, "DISCOPONG")}>Disco</button>  
            {
                isFriend ?
                <button className='profileButton' onClick={(e) => addFriend(e)}>Add Friend</button> :
                <button className='profileButton' onClick={(e) => removeFriend(e)}>Remove Friend</button> 
            }
            {
                isBlocked ?
                <button className='profileButton' onClick={(e) => blockUser(e)}>block</button> :
                <button className='profileButton' onClick={(e) => unblockUser(e)}>unblock</button> 
            }
            <button className='profileButton' onClick={(e) => directMessage(e)}>send message</button>
            <button className='profileButton' onClick={(e) => channelRequest(e)}>Invite to Channel</button>
            {
                channels.length != 0 &&
                <>
                select a channel
                {channels.map((element, index) => (
                    <li key={index} className="listChat">
                        <span className="listChatUser__text" onClick={(e) => channelInvite(e, element.channelId)}>{element.channelName}</span> 
                    </li>
                ))}
                </>
            }
        </>
    )
}

