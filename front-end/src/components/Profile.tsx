import React, { useEffect, useState, useContext } from 'react'
import { useCookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';
import { IUser } from '../interfaces';
import ProfileUser from './ProfileUser';
import { SocketContext } from './Socket';


const Profile: React.FC = () => {
    const socket = useContext(SocketContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [cookies] = useCookies(['userID', 'user']);
    const [user, setUser] = useState<IUser>();

    // EVENT LISTENERS
    useEffect(() => {
        socket.on("get_user", response => {
            if (response.success && response.user.userId == Number(searchParams.get("id"))) {
                console.log("get_user success profile");
                setUser(user => response.user);
            }
        })

        return () => {
            socket.off("get_user");
        }
    }, [])

    useEffect(() => {
        if (searchParams.get("id")) {
            socket.emit("chat", {
                userId: cookies.userID,
                authToken: cookies.user,
                eventPattern: "get_user", 
                data: {
                    user_id: cookies.userID,
                    requested_user_id: searchParams.get("id")
                }
            });
            console.log(`emiting get_user ${searchParams.get("id")}`);
        }
    }, [searchParams]) 


    return (
        <div className='profile'>
            {
                user ?
                <ProfileUser user={user} queryId={Number(searchParams.get("id"))}/> :
                <p>User doest exist</p>
            }
        </div>
    )
}

export default Profile