import React, {useEffect, useState} from 'react';
import './LeftSidebar.scss';
import {ActiveRoom, Genre, Movie, User} from "../../logic/objects";
import {useNavigate} from "react-router";
import {displayMovie} from "../home/Home";

function displayRoom(room: ActiveRoom, navigate: any) {
    return (
        <div className="room display" onClick={() => navigate('/watch/' + room.id)}>
            <img className="cover" src={room.image} alt="movie"/>
            <div className="text">
                <span className="name">{room.name}</span>
                <div className="viewers"><span className="count">{room.viewers}</span> <svg className="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c3.79 0 7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5S10.62 9 12 9m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z"/></svg></div>
            </div>
        </div>
    )
}

export const LeftSidebar = () => {
    // let history: Movie[] = [{id: 0, genre: 0, name: "Movie 0", url: "images/movie.jpg"},
    //     {id: 1, genre: 0, name: "Movie 1", url: "images/movie.jpg"},
    //     {id: 2, genre: 0, name: "Movie 2", url: "images/movie.jpg"}]

    const [rooms, setRooms] = useState<ActiveRoom[]>([new ActiveRoom(0, 1, 'Shrek 2', '/images/movie.jpg', 3)])

    useEffect(() => {
        // fetch('http://localhost:5000/active_rooms')
        //     .then(async res => {
        //         let json = (await res.json()) as []
        //         setRooms(json.map(room => new ActiveRoom(room['id'], room['movie_id'], room['name'], room['image'], room['viewers'])))
        //     })
        // setRooms([new ActiveRoom(0, 1, 'Shrek 2', '/images/movie.jpg', 3)])
    }, []);

    let navigate = useNavigate()

    return (
        <div className="LeftSidebar sidebar">
            <div className="content">
                <div className="account_view">
                    <h4 className="name">0 Active Streams</h4>
                </div>
                <div className="history">
                    {rooms.map(room => displayRoom(room, navigate))}
                </div>
            </div>
        </div>
    )
}