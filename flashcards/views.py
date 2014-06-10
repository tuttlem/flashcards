
import os
from flask import render_template, request, redirect, url_for, jsonify, json
from flashcards import app

@app.route('/')
def show_home():
   return render_template('home.html')

@app.route('/test')
def show_test():
   return render_template('test.html')

