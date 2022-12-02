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

    // EVENT LISTENERS & EMITTERS ON MOUNT
    useEffect(() => {
        socket.on("isEnabled_2fa", response => {
            setHasTwoFA(hasTwoFA => response.success);
        }) 

        socket.on("remove_2fa", response => {
            if (response.success)
                setHasTwoFA(hasTwoFA => false);
            else
                alert(response.msg);
        })

        socket.on("enable_2fa", response => {
            if (response.success) {
                setQrcode(response.qrCode);
                // toggle verify menu
                document.getElementById("verify_TwoFA")?.classList.toggle("twoFA_show");
            }
            else
                alert(response.msg);
        })

        socket.on("verify_2fa", response => {
            if (response.success)
                setHasTwoFA(hasTwoFA => true);
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

    // USE EFFECT TO EMIT TO AVATAR WHEN IMAGE CHANGES 
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
        // socket.emit("enable_2fa", {
        //     userId: cookies.userID,
        //     authToken: cookies.user,
        //     eventPattern: "enable_2fa", 
        //     data: {user_id: cookies.userID}
        // });
        console.log(`emiting enable_2fa`);
    }

    // VERIFY THE 2FA TOKEN AFTER SCANNING
    const verifyTwoFA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // socket.emit("verify_2fa", {
        //     userId: cookies.userID,
        //     authToken: cookies.user,
        //     eventPattern: "verify_2fa", 
        //     data: {user_id: cookies.userID, TFAToken: token}
        // });
        console.log(`emiting remove_2fa`);
        document.getElementById("verify_TwoFA")?.classList.toggle("twoFA_show");
        setToken("");
        setQrcode("");
    }

    // DISABLE -> USER NEEDS TO ADD HIS ONE TIME TOKEN
    const disableTwoFA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // socket.emit("remove_2fa", {
        //     userId: cookies.userID,
        //     authToken: cookies.user,
        //     eventPattern: "remove_2fa", 
        //     data: {user_id: cookies.userID, TFAToken: token}
        // });
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
                console.log(event.target.files![0]);
                setSelectedImage(event.target.files![0]);
                }}
            />
            {
                hasTwoFA ?
                <button className='profileButton' onClick={() => document.getElementById("disable_TwoFA")?.classList.toggle("twoFA_show")}>disable 2FA</button> :
                <button className='profileButton' onClick={(e) => enableTwoFA(e)}>enable 2FA</button>
            }
            <div className='twoFA' id="verify_TwoFA">
                <img src={qrcode} alt="qrCode" className="profileAvatar"/>
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

export const UserFriendSettings : React.FC<Props> = (user) => {

    return (
        <>
            <button className='profileButton'>Remove/add Friend</button> 
            <button className='profileButton'>Invite to Pong</button> 
        </>
    )
}

