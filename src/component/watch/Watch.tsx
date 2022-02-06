import React, {createRef, Fragment, useEffect, useRef, useState} from 'react';
import './Watch.scss';
import {useParams} from "react-router";
import {API_URL, SOCKET_HOST} from "../../index";
import pause from '../../icons/pause.svg'
import play from '../../icons/play.svg'

interface ChatItem {
    display(): React.ReactElement;
}

class Message implements ChatItem {
    user: string // name
    message: string

    constructor(user: string, message: string) {
        this.user = user;
        this.message = message;
    }

    display(): React.ReactElement {
        return (
            <div className="message">
                <span className="name">{this.user}</span>
                <p className="text">{this.message}</p>
            </div>
        );
    }
}

class UserJoin implements ChatItem {
    user: string

    constructor(user: string) {
        this.user = user;
    }

    display(): React.ReactElement {
        return (
            <div className="user_join">
                <span className="text">{this.user} has joined!</span>
            </div>
        );
    }
}

export const Watch = () => {
    const {id} = useParams<'id'>();

    const [websocket, setWebsocket] = useState<WebSocket | undefined>()
    const [items, setItems] = useState<ChatItem[]>([])
    const [loading, setLoading] = useState(true)
    const [viewers, setViewers] = useState(0)
    const [movieId, setMovieId] = useState(0)
    const [paused, setPaused] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | undefined>()

    let messageRef = createRef<HTMLInputElement>()
    let videoRef = useRef() as React.MutableRefObject<HTMLVideoElement>

    let username = localStorage.getItem('username')

    function addItem(item: ChatItem) {
        setItems(prev => [item, ...prev])
    }

    function sendMessage(message: string | undefined) {
        console.log(message);
        console.log(websocket);
        if (message == undefined) return;
        if (websocket == undefined) {
            return
        }

        console.log('Sending message: ' + message);
        addItem(new Message('Me', message))
        websocket.send(JSON.stringify({'type': 'message', 'user': username, 'message': message}))
    }

    useEffect(() => {
        if (id == undefined) {
            setErrorMessage('Invalid chat room')
            return
        }

        if (localStorage.getItem('token') == undefined) {
            setErrorMessage('You must be logged in for this')
            return
        }

        console.log('Username: ' + username);

        fetch(`${API_URL}/join_active_room`, {
            method: 'POST',
            body: JSON.stringify({
                'user_id': localStorage.getItem('id'),
                'room_id': id,
            }),
        }).then(async res => {
            let json = await res.json()
            let status = json['status']
            if (status == 'error') {
                setErrorMessage('There was an error adding you to the chat room')
                return
            }

            setMovieId(json['movie_id'])
            setViewers(json['viewers'])

            console.log('Joined the room, connecting to socket...');

            try {
                // ALL messages must contain a `user` param with the current username
                const websocket = new WebSocket(`${SOCKET_HOST}:${5001 + parseInt(id)}`)

                websocket.onopen = function (event) {
                    console.log(event);
                    console.log('Connected to socket!');
                    setLoading(false)
                    websocket.send(JSON.stringify({'type': 'connected', 'user': username}));
                    addItem(new UserJoin(username ?? ''))
                };

                websocket.onmessage = function (event: MessageEvent) {
                    let json = JSON.parse(event.data)
                    console.log(json);

                    let user = json['user']
                    if (user == username) return

                    if (json['type'] == 'connected') {
                        addItem(new UserJoin(user))
                    } else if (json['type'] == 'pause') {
                        console.log('Pausing movie!');
                        videoRef.current?.pause()
                    } else if (json['type'] == 'play') {
                        console.log('Playing movie!');
                        console.log(videoRef.current);
                        videoRef.current?.play().catch(e => console.log(e))
                    } else if (json['type'] == 'message') {
                        console.log('Adding message ' + json);
                        console.log('Current: ' + items);
                        addItem(new Message(user, json['message']))
                    }
                }

                websocket.onclose = function (e: Event) {
                    console.log(e);
                    setLoading(true)
                    setErrorMessage('The server has disconnected')
                }

                websocket.onerror = function (e: Event) {
                    console.log(e);
                    setErrorMessage('There was an error connecting to the socket')
                }

                setWebsocket(websocket)
            } catch (e) {
                console.log(e);
                setErrorMessage('An error occurred')
            }
        })
    }, []);

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (messageRef.current == undefined) return
        if (e.keyCode == 13) { // Enter
            sendMessage(messageRef.current.value)
            messageRef.current.value = ''
        }
    }

    function changePlayState() {
        if (websocket == undefined || videoRef.current == undefined) return
        websocket.send(JSON.stringify({'type': paused ? 'play' : 'pause', 'user': username}));
        setPaused(!paused)

        if (paused) {
            videoRef.current.play()
        } else {
            videoRef.current.pause()
        }
    }

    return (
        <div className="Watch">
            <div className="video">
                {loading
                    ? <div className="loading-container">
                        <span className="text">{errorMessage ?? 'Loading...'}</span>
                    </div>
                    : <Fragment>
                        <video ref={videoRef} className="player">
                            <source src={`/videos/${movieId}.mp4`} type="video/mp4"/>
                            Your browser isn't good enough for this
                        </video>
                        <div className="controls"><button onClick={() => changePlayState()} className="play_pause"><img src={paused ? pause : play} alt="play/pause"/></button></div>
                    </Fragment>}
            </div>
            <div className="chat">
                <h3 className="title">Chat Room</h3>
                <div className="messages">
                    {items.map(item => item.display())}
                </div>
                <div className="send">
                    <input ref={messageRef} type="text" onKeyDown={e => onKeyDown(e)}/>
                    <svg onClick={() => sendMessage(messageRef.current?.value)} className="enter" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0z" fill="none"/>
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}
