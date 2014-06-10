
import os
from flask import render_template, request, redirect, url_for, jsonify, json
from flashcards import app

@app.route('/')
def show_home():
   return render_template('home.html')

@app.route('/test')
def show_test():
   return render_template('test.html')

@app.route('/data/types')
def retrieve_types():
   SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
   json_url = os.path.join(SITE_ROOT, "static/data", "types.json")
   data = json.load(open(json_url))
   return jsonify(data)
