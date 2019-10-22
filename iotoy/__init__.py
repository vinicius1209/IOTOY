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
    
# Sql Alchemy / Migrate / Login Manager
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

# Flask Definitions
def create_app():
    app = FlaskVue(__name__)
    app.config.from_mapping(
        SECRET_KEY = 'iotoyComputacao',
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
            'sqlite:///' + os.path.join(app.instance_path, 'iotoy.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS = False
    )

    # Cors
    CORS(app)

    # Database
    db.init_app(app)
    migrate.init_app(app, db)

    # Login manager
    login_manager.init_app(app)
    login_manager.login_view = 'login'

    from . import models
    from . import routes
    app.register_blueprint(routes.bp)

    return app

