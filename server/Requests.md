POST /api/register
    request:  {"email": "", "username": "", "password": ""}
    response: {"id": 0, "2fa": "code"}

// After you register and add the app to the auth app, you send the generated code to the server
POST /api/register_verify
    request:  {"code": ""}
    response: {"code": ""}

POST /api/login
    request:  {"email": "", "username": "", "password": ""}
    response: {"token": ""}

POST /api/users/add_friend
    request:  {"username": ""}
    response: {}

GET /api/history
    request:  {"token": ""}
    response: [{"name": "", "id": 0, "image": "url"}, ...]

GET  /api/genres
    request:  {}
    response: [{"name": "", "id": 0, "image": "url"}, ...]

GET /api/featured
    request:  {}
    response: [{"name": "", "id": 0, "image": "url"}, ...]

GET /api/active_rooms
    request:  {}
    response: [{"id": 0, "movie_id": 0, "name": "movie name", "image": "screenshot url?", "viewers": 3}, ...]

// Starts a movie hosting with a given genre and your current user ID and a genre name 
POST /api/create_active_room
    request:  {"movie_id": 0, "genre": "genre name"}
    response: {"room_id": 0}

// Joins a host
POST /api/join_active_room
    request:  {"room_id": 0}
    response: {}

// Starts an existing hosted
POST /api/start_active_room
    request:  {"room_id": 0}
    response: {}

//adds a movie to the DB
POST /api/add_movie
    request: {"title": "", "url": "", "genre_id": ""}
    response: {}
TODO: Some socket thing to tell people when stuff starts and a movie and a url to the movie



Socket requests:

// Send chat message
Client -> Server
{"message": "some chat message"}
    then send same data to all clients in the chat room

// Start the movie
{"status": "start"}
    send all data to all clients

// stops
{"status": ""}
