from app import db, login_manager
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import current_user

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    api_key = db.Column(db.String(255))
    api_url = db.Column(db.String(255))

    def __repr__(self):
        return '<User {}>'.format(self.username) 

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_active(self):
        return True

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return self.id
        except AttributeError:
            raise NotImplementedError('Erro em get_id na classe User')

@login_manager.user_loader
def load_user(id):
    return User.query.get(id)


class Toy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(120), nullable=True, index=True, unique=False)
    mac_address = db.Column(db.String(17), nullable=False, index=True, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User')


class Sound(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(120), nullable=False, index=True, unique=False)
    part = db.Column(db.String(30), nullable=False, index=True, unique=False)
    toy_id = db.Column(db.Integer, db.ForeignKey('toy.id'), nullable=False)
    toy = db.relationship('Toy')

