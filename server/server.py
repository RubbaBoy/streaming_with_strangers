from flask import Flask
from flask_restful import Resource, Api
from api.nac_api import *
from api.utils import *

app = Flask(__name__) #create Flask instance

api = Api(app) #api router

#associate the created api resources with a path
api.add_resource(Register, '/register')
api.add_resource(RegisterVerify, '/register_verify')
api.add_resource(Login, '/login')
api.add_resource(History, '/history')
api.add_resource(Genres, '/genres')
api.add_resource(Featured, '/featured')
api.add_resource(ActiveRooms, '/active_rooms')
api.add_resource(CreateActiveRoom, '/create_active_room')
api.add_resource(JoinActiveRoom, '/join_active_room')
api.add_resource(StartActiveRoom, '/start_active_room')


@app.after_request
def apply_caching(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


if __name__ == '__main__':
    print("Starting flask")
    print("Starting Database")
    exec_sql_file('deploy.sql')
    app.run(debug=True,host='0.0.0.0'), #starts Flask
