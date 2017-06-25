from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

application = Flask(__name__, static_url_path='', static_folder='frontend')
application.config.from_object('config')
db = SQLAlchemy(application)
