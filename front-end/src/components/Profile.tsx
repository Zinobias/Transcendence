import React, { useEffect, useState, useContext } from 'react'
import { useCookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';
import { IUser } from '../interfaces';
import { SocketContext } from './Socket';

/*
    check what profile it should display with the searchParams
    send the userId/Name with the navigate through params
    only valid userid/name should be allowed
    query strings
*/

const Profile: React.FC = () => {
    const socket = useContext(SocketContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [state, setState] = useState<boolean>(false);
    const [qrcode, setQrcode] = useState<string>("");
    const [cookies] = useCookies(['userID', 'user']);
    const [user, setUser] = useState<IUser>();

    // EVENT LISTENERS
    useEffect(() => {
        socket.on("get_user", response => {
            if (response.success) {
                console.log("get_user success");
                setState(state => !state);
                setUser(user => response.user);
            }
        })

        socket.on("enable_2fa", response => {
            if (response.success) {
                console.log(`socket.on ${response.msg} ${response.qrCode}`);
                setQrcode(response.qrCode);
            }
            else
                console.log(`socket.on ${response.msg}`);
        })

        return () => {
            socket.off("get_user");
            socket.off("enable_2fa");
        }
    }, [])

    useEffect(() => {
        if (searchParams.get("id") && !state) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "get_user", 
                data: {user_id: searchParams.get("id")}
            });
            console.log(`emiting get_user ${searchParams.get("id")}`);
        }
    }, []) 

    const handle2FA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        socket.emit("enable_2fa", {
            userId: cookies.userID,
            authToken: cookies.user,
        });
        console.log(`emiting enable_2fa`);
    }

    return (
        <div>
            {
                state ?
                <p>{user?.name}'s Profile</p> :
                <p>User doest exist</p>
            }
            {/* <button className='defaultButtonA' onClick={(e) => handle2FA(e)}>ENABLE 2FA</button>
            <br/><br/>
            {
                qrcode && 
                <img src={qrcode}/>
            } */}
        </div>
    )
}

export default Profile