import os
from os.path import join, dirname, realpath

class Config(object):
	SECRET_KEY = 'iotoyComputacao'
	SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(app.instance_path, 'iotoy.db')
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	SEND_FILE_MAX_AGE_DEFAULT = 0
