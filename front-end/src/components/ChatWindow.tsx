import React, { useState, useRef, useEffect }  from "react";

const   ChatWindow: React.FC = () => {
	
    const [message, setMessage] = useState<string>("");
    const [chat, setChat] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    console.log("new chat window");


    useEffect(() => {
        inputRef.current?.focus();
    }, [])

    const handleMessage = (e: React.FormEvent) => {
        e.preventDefault();
        // console.log(message);
        // <ChatMessage message={message}/>
        setChat([...chat, message]);
        setMessage("");
    }

    return (
        <div className="chatroom">
            New Chat Room
            <form className="chatroom__form"  onSubmit={(e) => {
                    handleMessage(e)
                    // inputRef.current?.blur();
                    }}>
                <input 
                    className="chatroom__form--input" 
                    ref={inputRef}
                    type="input"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}  
                    // placeholder="Enter your message"
                />
            </form>
            <div className="chatroom__text">
                {chat.map((element, index) => {
                return (
                <div key={index} className="chatroom__text--bubble__left">
                    <p>USER<br/>{element}</p>
                </div>
                );
            })}
            </div>
        </div>
    )
};

export default ChatWindow;