from flask import Flask, request, jsonify, make_response, send_file
from flask_cors import CORS
import uuid
from bcrypt import hashpw, gensalt, checkpw
from pymongo import MongoClient
from datetime import datetime
import os
from magic import Magic

###############################################################################
# Constants

# mongodb uri
#   address to mongo database
MONGOURI = 'mongodb://' + '127.0.0.1:27018'

# backend port
#   port to reach these functions
PORT = 5000

# storage directory
#   path used to store uploads
STORAGE = 'storage'

# admin info
#   set defaults for login into admin account
USERNAMEDEF = 'admin'
PASSWORDDEF = 'admin'

###############################################################################
# Set up

# mongo
client = MongoClient(MONGOURI)
db = client['data']

# flask
app = Flask(__name__)

# cors
CORS(app, resources={f'/api/*': {'origins': '*'}})

# TODO initialize storage path if needed

###############################################################################
# Database

#------------------------------------------------------------------------------
# users collection schema
if 'users' not in db.list_collection_names():
    db.create_collection('users', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['username', 'password', 'uploadedFiles'],
            'properties': {
                'username': {
                    'bsonType': 'string'
                },
                'password': {
                    'bsonType': 'string'
                },
                'uploadedFiles': {
                    'bsonType': 'array',
                    'items': {
                        'bsonType': 'object'
                    },
                },
                'sessionID': {
                    'bsonType': 'string'
                }
            }
        }
    })

    # add default user
    admin = {
        'username': USERNAMEDEF,
        'password': hashpw(PASSWORDDEF.encode(), gensalt()).decode(),
        'uploadedFiles': []
    }

    db['users'].insert_one(admin)

#------------------------------------------------------------------------------
# files collection schema
if 'files' not in db.list_collection_names():
    db.create_collection('files', validator={
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['id', 'type'],
            'properties': {
                'id': {
                    'bsonType': 'string'
                },
                'filename': {
                    'bsonType': 'string'
                },
                'type': {
                    'bsonType': 'string'
                },
                'name': {
                    'bsonType': 'string'
                },
                'description': {
                    'bsonType': 'string'
                },
                'uploaded': {
                    'bsonType': 'date'
                }
            }
        }
    })

filesCol = db['files']
usersCol = db['users']

###############################################################################
# Api calls

#------------------------------------------------------------------------------
# test calls

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify(result='Valid'), 200

#------------------------------------------------------------------------------
# user management calls

@app.route('/api/login', methods=['OPTIONS', 'POST'])
def login():
    # preflight
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if query := usersCol.find_one({'username': username}):
        if checkpw(password.encode(), query['password'].encode()):
            currid = str(uuid.uuid4())
            usersCol.update_one({'username': username}, {'$set': {'sessionID': currid}})
            return jsonify(res=currid), 200
    return jsonify(error='Incorrect username and password'), 401

@app.route('/api/logout', methods=['OPTIONS', 'POST'])
def logout():
    # preflight
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    data = request.json
    sessionID = data.get('sessionID')

    if usersCol.find_one({'sessionID': sessionID}):
        usersCol.update_one({'sessionID': sessionID}, {'$unset': {'sessionID': ''}})
        return jsonify(res='Session terminated'), 200
    return jsonify(error='No session to terminate'), 404

#------------------------------------------------------------------------------
# file upload & checking calls

@app.route('/api/files', methods=['GET'])
def getFiles():
    res = list(filesCol.find({}, {'_id': 0}))
    return jsonify(result=res), 200

@app.route('/api/files/<id>', methods=['GET'])
def getFileById(id):
    res = filesCol.find_one({'id': id}, {'_id': 0})
    if not res:
        return jsonify(error='File not found'), 404
    return jsonify(result=res), 200

@app.route('/api/files/<id>/download', methods=['GET'])
def downloadFileById(id):
    res = filesCol.find_one({'id': id}, {'_id': 0})
    path = os.path.join(STORAGE, res['filename'])

    if os.path.exists(path):
        return send_file(path), 200
    return jsonify(error='File not found'), 404

@app.route('/api/upload', methods=['OPTIONS', 'POST'])
def uploadFile():
    # preflight
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    file = request.files['file']
    if not file:
        return jsonify(error='No file uploaded'), 400
    
    # get file mime type instead of dealing with mislabeled files
    mime = Magic(mime=True)
    mime = mime.from_buffer(file.read())
    ext = getExt(mime)
    file.seek(0)

    # get neccessary data
    currid = str(uuid.uuid4())
    fname = currid + ext
    data = request.form
    name = data.get('name', str(datetime.now()))
    descr = data.get('descr', '')
    path = os.path.join(STORAGE, fname)
    time = datetime.now()

    # add to db
    filesCol.insert_one({
        'id': currid,
        'filename': fname,
        'type': mime,
        'name': name,
        'description': descr,
        'uploaded': time,
    })

    # save file in storage
    file.save(path)

    return jsonify(result='Successfully uploaded', fname=fname), 200

###############################################################################
# Helper functions

# case function to get correct file extension
def getExt(mime: str=''):
    match mime:
        # originally for image hosting
        case 'image/jpeg':
            return '.jpg'
        case 'image/png':
            return '.png'
        case 'image/svg+xml':
            return '.svg'
        case 'image/webp':
            return '.webp'
        
        # additional mimes
        case 'application/zip':
            return '.zip'
        case 'audio/flac':
            return '.flac'
        case _:
            return ''

###############################################################################
# Running

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)