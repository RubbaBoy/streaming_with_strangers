
CREATE TABLE IF NOT EXISTS genres(
    id SERIAL PRIMARY KEY NOT NULL,
    name varchar(128) NOT NULL,
    color1 varchar(6),
    color2 varchar(6)
);

CREATE TABLE IF NOT EXISTS movies(
    id SERIAL PRIMARY KEY NOT NULL,
    genre_id INT,
    name varchar(128) NOT NULL,
    image_url varchar(256),
    is_featured boolean DEFAULT true,
    FOREIGN KEY(genre_id) REFERENCES genres(id)
);


CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY NOT NULL,
    name varchar(128) NOT NULL,
    password varchar(128) NOT NULL,
    email varchar(128),
    token varchar(128),
    authkey varchar(42)
);

CREATE TABLE IF NOT EXISTS history(
    user_id INT,
    movie_id INT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS activerooms(
    id SERIAL PRIMARY KEY NOT NULL,
    movie_id INT,
    viewers integer,
    movie_started boolean DEFAULT false,
    FOREIGN KEY(movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS activeroomusers(
    user_id INT,
    activeroom_id INT,
    FOREIGN KEY(activeroom_id) references activerooms(id),
    FOREIGN KEY(user_id) references users(id)
);
