#!/usr/bin/env python3
from flask import Flask, request, jsonify
import sqlite3

'''
REST API for status blog
'''


db = sqlite3.connect("blog.db", check_same_thread=False)
cur = db.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS blog (username TEXT PRIMARY KEY, status TEXT)")
cur.execute("CREATE TABLE IF NOT EXISTS user (username TEXT PRIMARY KEY, password TEXT)")

cur.execute("INSERT OR IGNORE INTO blog values('devuser0', 'testing 0 1 2!')")

cur.execute("INSERT OR IGNORE INTO blog values('devuser1', 'testing 1 2 3!')")

cur.execute("INSERT OR IGNORE INTO blog values('tester1', 'creatively testing this <i>secure</i> app')")

cur.execute("INSERT OR IGNORE INTO user values('testuser', 'test')")

db.commit()

app = Flask(__name__)


@app.route('/users') # list all users
def users():
    res = []
    cur = db.cursor()
    cur.execute("SELECT username FROM blog")
    rows = cur.fetchall()
    for r in rows:
        res.append(r[0])
    return jsonify({"users":res})

@app.route('/status') # get status for a user
def status():
    username = request.args.get('username')
    if not username:
        return {"status": "ERROR"}
    cur = db.cursor()
    cur.execute("SELECT status from blog WHERE username = '" + username + "'")
    row = cur.fetchone()
    return jsonify({"status":row[0]})

@app.route('/post', methods=["POST"])
def post():
    username = request.form.get("username")
    status = request.form.get("status")

    if username and status:
        cur = db.cursor()
        cur.execute("INSERT INTO blog VALUES(?, ?) ON CONFLICT (username) DO UPDATE SET status = ?", (username, status, status))
        db.commit()
        return "OK"
    else:
        return "Missing arguments", 400

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    cur = db.cursor()
    cur.execute(f"SELECT username from user WHERE username = '{username}' AND password = '{password}'")
    row = cur.fetchone()
    if row:
        return row[0]
    else:
        return "wrong password", 401


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
