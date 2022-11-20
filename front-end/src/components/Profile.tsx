import React, { useEffect, useState, useContext } from 'react'
import { useCookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';
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
    const [cookies] = useCookies(['userID', 'user']);


    useEffect(() => {
        if (searchParams.get("id") && !state) {
            //console.log(searchParams.get("id"));
            //check if valid ID and if so set to true otherwise nothing
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "get_user", 
                data: {user_id: searchParams.get("id")}
            });
            console.log(`emiting get_user ${searchParams.get("id")}`);
            setState(true);
        }

        socket.on("get_user", response => {
            console.log(`socket.on get_user [${response?.data}]`);
        })

        socket.on("enable_2fa", response => {
            if (response.success) {
                console.log(`socket.on enable_2fa ${response.msg} ${response.qrCode}`);
            }
            else
                console.log(`socket.on enable_2fa ${response.msg}`);
        })

        return () => {
            socket.off("get_user");
            socket.off("enable_2fa");
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
                <p>Profile</p> :
                <p>Page doest exist</p>
            }
            <button className='defaultButtonA' onClick={(e) => handle2FA(e)}>ENABLE 2FA</button>
        </div>
    )
}

export default Profile