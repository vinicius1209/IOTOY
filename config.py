import os
from os.path import join, dirname, realpath
basedir = os.path.abspath(os.path.dirname(__file__)) + '/iotoy'
class Config(object):
	SECRET_KEY = 'iotoyComputacao'
	SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	OFENSIVE_FILE = os.path.join(basedir, 'ofensive.txt')
	SOUNDS_URL = os.path.join(basedir, 'static/sounds')
