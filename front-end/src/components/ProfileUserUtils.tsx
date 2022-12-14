import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import { IUser } from '../interfaces';
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
                console.log("socket.on remove_2fa success");
                setHasTwoFA(hasTwoFA => false);
            }
            else
                alert(response.msg);
        })

        socket.on("enable_2fa", response => {
            if (response.success) {
                console.log("socket.on enable_2fa success");
                setQrcode(response.qrCode);
                // toggle verify menu
                document.getElementById("verify_TwoFA")?.classList.toggle("twoFA_show");
            }
            else
                alert(response.msg);
        })

        socket.on("verify_2fa", response => {
            if (response.success) {
                console.log("socket.on varify_2fa success");
                setHasTwoFA(hasTwoFA => true);
            }
            else
                alert(response.msg);
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
                console.log('emitting update_avatar');   
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
        console.log(`emiting enable_2fa`);
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
        console.log(`emiting verify_2fa`);
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
        console.log(`emitting remove_2fa`);
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
    const [cookies] = useCookies(['userID', 'user']);
    const [me, setMe] = useState<IUser>();
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const socket = useContext(SocketContext);

    // get my own user profile to check on mount
    useEffect(() => {
        socket.on("get_user", response => {
            if (response.success && response.user.userId == cookies.userID) {
                setMe(me => response.user);
                setIsBlocked(isBlocked => !response.user.blocked.find((e : IUser) => user.userId == e.userId));
            }
        })

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
                console.log(response.msg);
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
                console.log(response.msg);

        })

        return () => {
            socket.off("get_user");
            socket.off('block_user');
            socket.off('unblock_user');
        }

    }, [])
    
    // useEffect on mount/change to check if user is a friend/blocked
    useEffect(() => {
        setIsFriend(isFriend => !user.friends.find((e) => cookies.userID == e.IUser.userId && e.confirmed == true));
    }, [user])

    const addFriend = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "friend_request",
            data: {user_id: cookies.userID, friend_id: user.userId}
        })
        console.log(`emitting friend_request`);
    }

    const removeFriend = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "un_friend",
            data: {user_id: cookies.userID, friend_id: user.userId}
        })
        console.log(`emitting un_friend`);
    }

    const blockUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "block_user",
            data: {user_id: cookies.userID, blocked_id: user.userId}
        })
        console.log(`emitting block_user`);
    }

    const unblockUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("chat", {
            userId: cookies.userID,
            authToken: cookies.user,
            eventPattern: "unblock_user",
            data: {user_id: cookies.userID, blocked_id: user.userId}
        })
        console.log(`emitting unblock_user`);
    }

    return (
        <>  
            <button className='profileButton'>Invite to Pong</button> 
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
        </>
    )
}

