import React from 'react';
import './RightSidebar.scss';
import {Movie, User} from "../../logic/objects";
import {useNavigate} from "react-router";
import {displayMovie} from "../home/Home";

export const RightSidebar = () => {
    // let history: Movie[] = [{id: 0, genre: 0, name: "Movie 0", url: "images/movie.jpg"},
    //     {id: 1, genre: 0, name: "Movie 1", url: "images/movie.jpg"},
    //     {id: 2, genre: 0, name: "Movie 2", url: "images/movie.jpg"}]
    let history: Movie[] = []

    let navigate = useNavigate();

    function logOut() {
        localStorage.removeItem('token')
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
