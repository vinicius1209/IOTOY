import os
from os.path import join, dirname, realpath
basedir = os.path.abspath(os.path.dirname(__file__)) + '/iotoy'
class Config(object):
	SECRET_KEY = 'iotoyComputacao'
	SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	SEND_FILE_MAX_AGE_DEFAULT = 0
