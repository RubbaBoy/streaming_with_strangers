from hashlib import sha256

from flask_restful import Resource
from flask_restful import request
from flask_restful import reqparse
from flask import jsonify, Response
from pyotp import *
import socket
import threading
import uuid
import psycopg2
import yaml
import os
# from 'utils.py' import *

# from server.api.utils import exec_commit, exec_get_all

def hash(string):
    return sha256(string.encode('utf-8')).hexdigest()

class Register(Resource):
    def post(self):
        args = request.get_json(force=True)
        # parser.add_argument('email')
        # parser.add_argument('username')
        # parser.add_argument('password')
        # args = parser.parse_args()

        print(args)


        key = random_base32()
        code_generator = totp.TOTP(key) # code.now() gives the code current auth code
        generator_uri = code_generator.provisioning_uri(name=args['email'], issuer_name='NAC') # gives the URI to be put into google authenticator
        hashed_password = hash(args['password'])
        exec_commit('INSERT INTO users (name, password, email, authkey) VALUES (%s, %s, %s, %s)',
                    [args['username'], hashed_password, args['email'], key])

        print('here ', hashed_password)

        # TODO: Max I added this
        token = uuid.uuid4()
        exec_commit("UPDATE users set token = %s WHERE name = %s", [str(token), args['username']])
        ###

        # generator_uri

        # Possible response object if we need headers
        # resp = Response({'uri': "TEST"})
        # resp.headers['Access-Control-Allow-Origin'] = '*'

        print('bruh')

        return jsonify({'uri': generator_uri, 'token': token})


class RegisterVerify(Resource):
    def post(self):
        args = request.get_json(force=True)
        # parser = reqparse.RequestParser()
        # parser.add_argument('token')
        # parser.add_argument('code')
        # args = parser.parse_args()

        db_authkey = exec_get_all('SELECT authkey FROM users WHERE token=%s', [args['token']])

        # TODO: is db_authkey a single var? Or should I array access[0]?
        valid_key = db_authkey[0]
        code_generator = totp.TOTP(valid_key)

        print('Valid key (generated in db): ', valid_key)

        #if the authkeys match
        if code_generator.verify(int(args['code'])):
            validcode = True
        else:
            validcode = False

        # response commented out for now
        # resp = Response({'login': validcode})
        # resp.headers['Access-Control-Allow-Origin'] = '*'

        return jsonify({'login': validcode})

        #verify code against our own code stored in backend


class Login(Resource):
    def post(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument('email') // TODO: ??
        # parser.add_argument('username')
        # parser.add_argument('password')
        # parser.add_argument('2fa')
        # args = parser.parse_args()
        args = request.get_json(force=True)

        db_resp = exec_get_all('select name, authkey from users where name=%s and password=%s', [args['username'], hash(args['password'])])[0]

        if (db_resp == []):
            return jsonify({'token': 'ERROR'})

        valid_username = db_resp[0]
        valid_key = db_resp[1]

        code_generator = totp.TOTP(valid_key) # code.now() gives the code current auth code

        if valid_username == args['username'] and code_generator.verify(int(args['2fa'])):#IF LOGIN IS SUCCESSFUL
            token = uuid.uuid4()
            exec_commit("UPDATE users set token = %s WHERE name = %s", [str(token), args['username']])
            resp ={'token': token}
        else:
            resp = {"token": "ERROR"}

        return jsonify(resp)

#TODO: IMPLEMENT FRIENDS FEATURES

# class AddFriend(Resource):
#     def post(self):
#         parser = reqparse.RequestParser()
#         parser.add_argument('username')
#         args = parser.parse_args()
#
#         #
#
# class Friends(Resource):
#     def get(self):
#         #RESPONDS WITH THE NAME AND ID OF ALL the logged in users' friends


class Genres(Resource):
    def get(self):
        db_genres = exec_get_all('SELECT name, id, color1, color2 FROM genres ORDER BY id')
        genre_list = []
        #parse through the returned data and extract it into a dictionary for each genre
        for genre in db_genres:
            genre_list.append({'name': genre[0], 'id': genre[1], 'color1': genre[2], 'color2': genre[3]})

        return jsonify(genre_list)


class Featured(Resource):
    def get(self):
        db_featured = exec_get_all("SELECT name, id, image_url FROM movies WHERE is_featured=true ORDER BY id")
        featured_list = []

        for movie in db_featured:
            featured_list.append({'name': movie[0], 'id': movie[1], 'image': movie[2]})

        return jsonify(featured_list)


class ActiveRooms(Resource):
    #{"id": 0, "movie_id": 0, "name": "movie name", "image": "screenshot url?", "viewers"
    def get(self):
        db_rooms = exec_get_all("SELECT activerooms(id), movies(movie_id), movies(name), movies(image_url), "
                                   "activeroom(viewers) FROM "
                                   "(activerooms RIGHT JOIN movies ON activerooms(movie_id) = movies(id))")
        activerooms_list = []

        for room in db_rooms:
            activerooms_list.append({'id': room[0], 'movie_id': room[1], 'name': room[2], 'image': room[3],
                                     'viewers': room[4]})

        return jsonify(activerooms_list)


# Creates a room where people watch stuff
class CreateActiveRoom(Resource):
    def post(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument('user_id')
        # parser.add_argument('movie_id')
        # args = parser.parse_args()
        args = request.get_json(force=True)

        class Server:
            def __init__(self):
                self.start_server()

            def start_server(self):
                self.s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)

                host = 'localhost'
                port = 5001

                self.clients = []

                self.s.bind((host,port))
                self.s.listen(100)

                print('Running on host: '+str(host))
                print('Running on port: '+str(port))


                while True:
                    c, addr = self.s.accept()

                    self.clients.append(c)

                    threading.Thread(target=self.handle_client,args=(c,addr,)).start()

            def broadcast(self,msg):
                for connection in self.clients:
                    connection.send(msg.encode())

            def handle_client(self,c,addr):
                while True:
                    try:
                        msg = c.recv(1024)
                    except:
                        c.shutdown(socket.SHUT_RDWR)
                        self.clients.remove(c)

                        break

                    if msg.decode() != '':
                        print('New message: '+str(msg.decode()))
                        for connection in self.clients:
                            if connection != c:
                                connection.send(msg)

        server = Server()

        # create anew active room with the correct movie id
        exec_commit("INSERT INTO activerooms (movie_id) VALUES (%s); ", [args['movie_id']])

        #get the most recently created room(should be the one we just created but is not actually secure)
        room_id = exec_get_all("SELECT max(id) FROM activerooms")

        #take the new room's id and add the current user into the room
        exec_commit("INSERT INTO activeroomusers(user_id, activeroom_id) VALUES (%s, %s)", [args['user_id'], room_id[0]])

        return jsonify({room_id: room_id})


# Makes a user join a room
class JoinActiveRoom(Resource):
    def post(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument('room_id')
        # parser.add_argument('user_id')
        # args = parser.parse_args()
        args = request.get_json(force=True)

        exec_commit("UPDATE activerooms set viewers = viewers + 1 WHERE id = %s", [args['room_id']])

        exec_commit("INSERT INTO activeroomusers(user_id, activeroom_id) VALUES (%s, %s)", [args['user_id'], args['room_id']])

        return jsonify({"status": "success"})


# Actually starting the movie
class StartActiveRoom(Resource):
    def post(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument('room_id')
        # args = parser.parse_args()
        args = request.get_json(force=True)


        exec_commit("UPDATE activerooms set movie_started=true where id=%s", [args['room_id']])

        return jsonify({"status": "success"})


class History(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('token')
        args = parser.parse_args()

        db_history = exec_get_all("SELECT movies(id), movies(genre_id), movies(name), movies(image_url) FROM "
                     "(history RIGHT JOIN movies ON history.user_id = movies.id)")

        history_list = []
        for movie in db_history:
            history_list.append({'movie_id': movie[0], 'genre_id': movie[1], 'name': movie[2], 'url': movie[3]})

        return jsonify(history_list)


class AddMovie(Resource):
    def post(self):
        # parse = reqparse.RequestParser()
        # parse.add_argument('title')
        # parse.add_argument('url')
        # parse.add_argument('genre_id')
        # args = parse.parse_args()
        args = request.get_json(force=True)

        exec_commit("INSERT INTO movies(genre_id, name, image_url) VALUES (%s, %s, %s)",
                    [args['genre_id'], args['title'], args['url']])
        return jsonify({"status": "success"})



# Fuck it


def connect():
    config = {}
    yml_path = os.path.join(os.path.dirname(__file__), 'db.yml')
    with open(yml_path, 'r') as file:
        config = yaml.load(file, Loader=yaml.FullLoader)

    return psycopg2.connect(dbname=config['database'],
                            user=config['user'],
                            password=config['password'],
                            host=config['host'],
                            port=config['port'])

def exec_sql_file(path):
    full_path = os.path.join(os.path.dirname(__file__), f'{path}')
    conn = connect()
    cur = conn.cursor()
    with open(full_path, 'r') as file:
        cur.execute(file.read())
    conn.commit()
    conn.close()

def exec_get_one(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    one = cur.fetchone()
    conn.close()
    return one

def exec_get_all(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    list_of_tuples = cur.fetchall()
    conn.close()
    return list_of_tuples

def exec_commit(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    result = cur.execute(sql, args)
    conn.commit()
    conn.close()
    return result


