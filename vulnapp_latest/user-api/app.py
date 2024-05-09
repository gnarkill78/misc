from flask import Flask, request, jsonify, session
from flask_session import Session
import sqlite3

'''
REST API for status blog
'''

# Connect to the database
db = sqlite3.connect("blog.db", check_same_thread=False)
cur = db.cursor()
# Create tables if they don't exist
cur.execute("CREATE TABLE IF NOT EXISTS blog (username TEXT PRIMARY KEY, status TEXT)")
cur.execute("CREATE TABLE IF NOT EXISTS user (username TEXT PRIMARY KEY, password TEXT)")
# Clear existing users
cur.execute("DELETE FROM user")
# Insert new users
cur.execute("INSERT OR IGNORE INTO blog values('devuser0', 'testing 0 1 2!')")
cur.execute("INSERT OR IGNORE INTO blog values('devuser1', 'testing 1 2 3!')")
cur.execute("INSERT OR IGNORE INTO blog values('tester1', 'creatively testing this <i>secure</i> app')")
cur.execute("INSERT OR IGNORE INTO user values('testuser', 'test')")
# Commit the changes
db.commit()

app = Flask(__name__)

# API key for authentication
API_KEY = '980u9wdhc978wh9hbf9w7hb97fhw9e7fb'
#app.secret_key = 'hnhdiuhiwuqnk2983d9nbd2937b9d723bd9b293d'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'hnhdiuhiwuqnk2983d9nbd2937b9d723bd9b293d'  # Set your secret key
Session(app)

# Define the expected endpoints that require authentication
AUTH_ENDPOINTS = ['/users', 'status', '/post']

# Authentication middleware
@app.before_request
def authenticate_request():
    # Check if the requested endpoint requires authentication
    if request.path in AUTH_ENDPOINTS:
        # Check for the presence of API key in the request headers
        if request.headers.get('API-Key') != API_KEY:
            return jsonify({"message": "API Key NOT Unauthorized"}), 401

@app.route('/users') # list all users
@app.route('//users')
def users():
    # Check for API key in the request headers
    if request.headers.get('API-Key') != API_KEY:
        return jsonify({"message": "Unauthorized User"}), 401

    username = session.get('username')
    print("Username for status listing is: ", username)
    res = []
    cur = db.cursor()
    cur.execute("SELECT username FROM blog")
    rows = cur.fetchall()
    for r in rows:
        res.append(r[0])
    return jsonify({"users": res})

@app.route('/status') #, methods=["GET"]) # get status for a user
def status():
    # Check for API key in the request headers
    if request.headers.get('API-Key') != API_KEY:
        return jsonify({"message": "Unauthorized Status"}), 401

    username = request.args.get('username')
    if username is None:
        print("Username parameter is missing")
        return jsonify({"status": "ERROR", "message": "Username parameter is missing"}), 400

    cur = db.cursor()
    cur.execute("SELECT status FROM blog WHERE username = ?", (username,))
    row = cur.fetchone()
    return jsonify({"Current status":row[0]})

@app.route('/status', methods=["POST"])
def post():
    # Check for API key in the request headers
    if request.headers.get('API-Key') != API_KEY:
        return jsonify({"message": "Not authorized to post"}), 401

    username = request.form.get("username")
    status = request.form.get("status")

    if username and status:
        cur = db.cursor()
#        cur.execute("INSERT INTO blog VALUES(?, ?) ON CONFLICT (username) DO UPDATE SET status = excluded.status", (username, status))
        cur.execute("INSERT INTO blog VALUES(?, ?) ON CONFLICT (username) DO UPDATE SET status = ?", (username, status, status))
        db.commit()
        return "OKI DOKI"
    else:
        return "Missing arguments", 400

@app.route('/login', methods=["POST"])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    cur = db.cursor()
    query = "SELECT username FROM user WHERE username = ? AND password = ?"
    cur.execute(query, (username, password))
    row = cur.fetchone()
    if row:
        # Store username in session
        session['username'] = username
        return {"message": "Login successful", "username": username}
    else:
        return {"error": "Invalid username or password"}, 401

@app.route('/logout', methods=["POST"])
def logout():
    # Clear the session data to log the user out
    session.clear()
    return redirect(url_for('/'))  # Redirect to the homepage or wherever you want after logout

# Custom error handler for 404 Not Found
@app.errorhandler(404)
def handle_not_found(error):
    # Check if the request path contains the port number
    if ':' in request.path:
        return jsonify({"message": "You are NOT Unauthorized"}), 401
    else:
        return jsonify({"message": "Page Not Found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
