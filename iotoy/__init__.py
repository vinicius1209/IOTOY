from flask import Flask, session
from flask_cors import CORS
from config import Config
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


# Custum Class 
class FlaskVue(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        variable_start_string='%%',
        variable_end_string='%%',
    ))
    
# Flask Definitions
app = FlaskVue(__name__)
app.config.from_object(Config) 

# Cors
CORS(app)

# Sql Alchemy / Migrate
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Login manager
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Routes
from . import routes 

if __name__ == '__main__':
  app.run()

