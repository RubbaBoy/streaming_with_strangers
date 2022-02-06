import React, {useEffect, useState} from 'react';
import './RightSidebar.scss';
import {ActiveRoom, Movie, User} from "../../logic/objects";
import {useNavigate} from "react-router";
import {displayMovie} from "../home/Home";
import {API_URL} from "../../index";

export const RightSidebar = () => {
    let [history, setHistory] = useState<Movie[]>([])

    useEffect(() => {
        if (localStorage.getItem('id') == null) return;
        fetch(`${API_URL}/history?user_id=${localStorage.getItem('id')}`)
            .then(async res => {
                let json = (await res.json()) as []
                setHistory(json.map(movie => new Movie(movie['movie_id'], movie['name'], `/images/${movie['movie_id']}.jpg`)))
            })
        // setHistory([new ActiveRoom(0, 1, 'Shrek 2', '/images/movie.jpg', 3)])
    }, []);

    let navigate = useNavigate();

    function logOut() {
        localStorage.removeItem('token')
        localStorage.removeItem('id')
        localStorage.removeItem('username')

        navigate('/')
    }

    let loggedIn = localStorage.getItem('token') != null

    return (
        <div className="RightSidebar sidebar">
            <div className="content">
                <div className="account_view">
                    <h4 className="name">{localStorage.getItem('username')}</h4>
                    {loggedIn && <button className="logout" onClick={() => logOut()}>Log out</button>}
                    {!loggedIn && <button className="login" onClick={() => navigate('/login')}>Log in</button>}
                </div>
                <h4>History</h4>
                <div className="history">
                    {history.map(movie => displayMovie(movie, navigate))}
                </div>
            </div>
        </div>
    )
}
