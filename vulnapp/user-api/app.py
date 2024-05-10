#!/usr/bin/env python3
from flask import Flask, request, jsonify, session
from flask_session import Session
import sqlite3
import re

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

app.secret_key = 'hnhdiuhiwuqnk2983d9nbd2937b9d723bd9b293d'

@app.route('/users') # list all users
@app.route('//users')
def users():
    username = session.get('username')
    print("Username for status listing is: ", username)
    res = []
    cur = db.cursor()
    cur.execute("SELECT username FROM blog")
    rows = cur.fetchall()
    for r in rows:
        res.append(r[0])
    return jsonify({"users": res})

@app.route('/status') # get status for a user
def status():
    username = request.args.get('username')
    if not username:
        return {"status": "ERROR"}
    cur = db.cursor()
    cur.execute("SELECT status from blog WHERE username = '" + username + "'")
    row = cur.fetchone()
    return jsonify({"status":row[0]})

@app.route('/status', methods=["POST"])
def post():
    username = request.form.get("username")
    status = request.form.get("status")

    if username and status:
        cur = db.cursor()
        cur.execute("INSERT INTO blog VALUES(?, ?) ON CONFLICT (username) DO UPDATE SET status = ?", (username, status, status))
        db.commit()
        return "UR OK INT YA"
    else:
        return "Missing arguments", 400

# Function to sanitize inputs
def sanitize_input(input_string):
    return re.sub(r'<.*?>', '', input_string)  # Remove HTML tags

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    # Validate username and password
    if not (username and password):
        return {"error": "Missing username or password"}, 400

    # Sanitize inputs
    username = sanitize_input(username)
    password = sanitize_input(password)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)

