export interface User {
    id: number
    email: string
    name: string
}

export class Genre {
    id: number
    name: string
    color1: string
    color2: string

    constructor(id: number, name: string, color1: string, color2: string) {
        this.id = id;
        this.name = name;
        this.color1 = color1;
        this.color2 = color2;
    }
}

export class Movie {
    id: number
    name: string
    url: string

    constructor(id: number, name: string, url: string) {
        this.id = id;
        this.name = name;
        this.url = url;
    }
}

export class ActiveRoom {
    id: number
    movie_id: number // movie id
    name: string // movie name
    image: string // screenshot url
    viewers: number

    constructor(id: number, movie_id: number, name: string, image: string, viewers: number) {
        this.id = id;
        this.movie_id = movie_id;
        this.name = name;
        this.image = image;
        this.viewers = viewers;
    }
}
