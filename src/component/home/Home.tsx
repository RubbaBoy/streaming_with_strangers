import React, {createRef, useEffect, useState} from 'react';
import './Home.scss';
import {RightSidebar} from "../right_sidebar/RightSidebar";
import {LeftSidebar} from "../left_sidebar/LeftSidebar";
import {Genre, Movie} from "../../logic/objects";
import {useNavigate} from "react-router";
import {API_URL} from "../../index";

export function displayGenre(genre: Genre) {
    return (
        <div className="genre display" style={{ background: `linear-gradient(to bottom right, #${genre.color1}, #${genre.color2})`}}>
            <span className="name">{genre.name}</span>
        </div>
    )
}

export function displayMovie(movie: Movie, navigate: any) {
    function startMovie() {
        fetch(`${API_URL}/create_active_room`, {
            method: 'POST',
            body: JSON.stringify({
                'user_id': parseInt(localStorage.getItem('id') ?? '0'),
                'movie_id': movie.id,
            }),
        }).then(async res => {
            let json = await res.json()
            let id = json['room_id']
            console.log('Created room with ID of: ' + id);
            navigate('/watch/' + id)
        })
    }

    return (
        <div className="movie display" onClick={() => startMovie()}>
            <img className="cover" src={movie.url} alt="genre"/>
            <span className="name">{movie.name}</span>
        </div>
    )
}

function abs(number: number) {
    if (number < 0) return number * -1
    return number
}

export const Home = () => {
    const [genres, setGenres] = useState<Genre[]>([])
    const [movies, setMovies] = useState<Movie[]>([])

    useEffect(() => {
        fetch(`${API_URL}/genres`)
            .then(async res => {
                let json = (await res.json()) as []
                setGenres(json.map(genre => new Genre(genre['id'], genre['name'], genre['color1'], genre['color2'])))
            })

        fetch(`${API_URL}/featured`)
            .then(async res => {
                let json = (await res.json()) as []
                setMovies(json.map(movie => new Movie(movie['id'], movie['name'], `/images/${movie['id']}.jpg`)))
            })
    }, []);

    let navigate = useNavigate();

    let genreRef = createRef<HTMLDivElement>()
    let hidingRef = createRef<HTMLDivElement>()

    let [shift, setShift] = useState(0)

    function scrollGenres(scrollAmount: number) {
        if (genreRef.current == undefined || hidingRef.current == undefined) return
        let current = genreRef.current!
        let hiding = hidingRef.current!

        console.log('Shift to ' + (shift + scrollAmount));

        if (shift + scrollAmount > 0) {
            setShift(0)
            return
        }

        console.log(abs(shift + scrollAmount - hiding.clientWidth) + ' > ' + current.clientWidth);
        if (abs(shift + scrollAmount - hiding.clientWidth) > current.clientWidth) {
            setShift(-current.clientWidth + hiding.clientWidth)
            return
        }

        setShift(shift + scrollAmount)
    }

    return (
        <div className="Home">
            <LeftSidebar/>

            <div className="body" >
                <img src="/images/logo.png" alt="logo"/>
                <div className="content">
                    <h3>Genres</h3>
                    <div className="genre-row">
                        <svg className="arrow left" onClick={() => scrollGenres((250 + 8) * 3)} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z"/></svg>
                        <div ref={hidingRef} className="hiding">
                            <div ref={genreRef} className="genres" style={{ transform: `translateX(${shift}px)`}}>
                                {genres.map(displayGenre)}
                            </div>
                        </div>
                        <svg className="arrow right" onClick={() => scrollGenres((250 + 8) * -3)} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z"/></svg>
                    </div>

                    <h3 className="featured_title">Featured</h3>
                    <div className="featured"> {/* UP and down scrolling, forever, pushes genres up */}
                        {movies.map(movie => displayMovie(movie, navigate))}
                    </div>
                </div>
            </div>

            <RightSidebar/>
        </div>
    )
}
