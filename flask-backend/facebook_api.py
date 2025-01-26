from flask import Flask, jsonify, request
import requests
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

#Facebook access token
ACCESS_TOKEN = 'EAAXbQXYvK2kBO6G0fpJAOnCm9MUYkrECNkouFSnEfIvOadZBMQKwFKdZAZBhmEBpUAnD5naByAZCOPr5YyZCeTPAjQgplomXC56a5Q3GJy7sV03rdXhUunx07bdUoZAnZAsE5jOSKNtIBMB1sr1cSNht6XPMEUFHfRRkcgWQnFcR58WgU0kzgP15KgNlVcsZCaH0ZBu3InxY1J2bGQH8cshICOCsTwRiztCdezNvlhmzIXnjl42ga18F3ho4OoyhRUAZDZD'
# Base function to retrieve user details
def get_facebook_user_details(fields):
    url = 'https://graph.facebook.com/me'
    params = {
        'fields': fields,
        'access_token': ACCESS_TOKEN
    }
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {'error': f"Request failed with status code {response.status_code}: {response.text}"}

# Endpoint for retrieving all user details
@app.route('/user_details', methods=['GET'])
def get_user_details():
    fields = 'id,name,likes,posts,birthday,hometown,location,photos,videos,friends,gender,age_range,link'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving just the user's ID
@app.route('/user_id', methods=['GET'])
def get_user_id():
    fields = 'id'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving just the user's name
@app.route('/user_name', methods=['GET'])
def get_user_name():
    fields = 'name'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving likes
@app.route('/user_likes', methods=['GET'])
def get_user_likes():
    fields = 'likes'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving posts
@app.route('/user_posts', methods=['GET'])
def get_user_posts():
    fields = 'posts'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving birthday
@app.route('/user_birthday', methods=['GET'])
def get_user_birthday():
    fields = 'birthday'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving location
@app.route('/user_location', methods=['GET'])
def get_user_location():
    fields = 'location'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving gender
@app.route('/user_gender', methods=['GET'])
def get_user_gender():
    fields = 'gender'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving age range
@app.route('/user_age_range', methods=['GET'])
def get_user_age_range():
    fields = 'age_range'
    data = get_facebook_user_details(fields)
    return jsonify(data)


# Endpoint for retrieving profile link
@app.route('/user_link', methods=['GET'])
def get_user_link():
    fields = 'link'
    data = get_facebook_user_details(fields)
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
