import React, {createRef} from 'react';
import './Watch.scss';
import {useParams} from "react-router";

interface Message {
    user: string // name
    message: string
}

export const Watch = () => {
    const { id } = useParams<'id'>();

    const messages: Message[] = [{user: "Adam Yarris", message: "Lorem ipsum stuff"},
        {user: "Max", message: "Lorem ipsum stuff"},
        {user: "Anthony", message: "Lorem ipsum stuff"},
        {user: "Tyler", message: "Lorem ipsum stuff"}]

    let messageRef = createRef<HTMLInputElement>()

    function sendMessage(message: string | undefined) {
        if (message == undefined) return;
        console.log('Sending message: ' + message);
        // TODO: Send messages
    }

    return (
        <div className="Watch">
            <div className="video">
                <p>Id: {id}</p>
            </div>
            <div className="chat">
                <h3 className="title">Chat Room</h3>
                <div className="messages">
                    {messages.map(message => (
                        <div className="message">
                            <span className="name">{message.user}</span>
                            <p className="text">{message.message}</p>
                        </div>
                    ))}
                </div>
                <div className="send">
                    <input ref={messageRef} type="text"/>
                    <svg onClick={() => sendMessage(messageRef.current?.value)} className="enter" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </div>
            </div>
        </div>
    )
}
