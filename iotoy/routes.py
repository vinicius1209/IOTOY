from iotoy import app, session, db
from iotoy.models import User, Toy, Sound
from flask import render_template, flash, url_for, request, abort, redirect, jsonify, send_file, send_from_directory, make_response
from flask_login import current_user, login_user, logout_user, login_required
from iotoy.watson import WatsonTTS
from iotoy.sounds import SoundTTS
import os
from datetime import datetime


@app.route('/', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "username" not in data:
            return abort(400)
        if "password" not in data:
            return abort(400)

        username = data["username"]
        password = data["password"]

        user = User.query.filter_by(username=username).first()
        
        # Check user pass
        if user is None: 
            return jsonify({"status": 404, "msg": "Usuário não existente"})
        if not user.check_password(password):
            return jsonify({"status": 404, "msg": "Senha preenchida incorreta"})
        
        login_user(user)
        return jsonify({"status": 200, "redirect": "/transformar"})
    else:
        if current_user.is_authenticated:
            return redirect(url_for('home'))

        return render_template('login.html')


@app.route('/logout', methods=['GET'])
@login_required
def logout():

    if current_user.is_authenticated:
        logout_user()
        return jsonify({"status": 200, "redirect": "/login"})


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True)

    if "username" not in data:
        return abort(400)
    if "password" not in data:
        return abort(400)
    if "email" not in data:
        return abort(400)
    if "mac_address" not in data:
        return abort(400)

    username = data["username"]
    password = data["password"]
    email = data["email"]
    mac_address = data["mac_address"]
    description = data["description"]

    try:
        # Verifica usuário
        user = User.query.filter_by(username=username).first()
        if user is not None:
            return jsonify({"status": 404, "msg": "Usuário não disponível"})

        # Verifica e-mail
        user = User.query.filter_by(email=email).first()
        if user is not None:
            return jsonify({"status": 404, "msg": "E-mail não disponível"})
        
        # Verifica brinquedo
        toy = Toy.query.filter_by(mac_address=mac_address).first()
        if toy is not None:
            return jsonify({"status": 404, "msg": "Código de brinquedo já cadastrado"})

        # Cria usuário e brinquedo
        user = User(username=username, email=email)
        user.set_password(password)        
        db.session.add(user)
        db.session.commit()

        # Agora busca o usuário criado para criar o brinquedo
        user = User.query.filter_by(username=username).first()
        if user is None or not user.check_password(password):
            return abort(500)

        # Cria o brinquedo
        toy = Toy(mac_address=mac_address, description=description, user_id=user.id)
        db.session.add(toy)
        db.session.commit()

        return jsonify({"status": 200})
    except Exception as e:
        print(e)
        return abort(500)


@app.route('/current_user/info', methods=['GET'])
@login_required
def current_user_info():
    return str(current_user.username).upper()


@app.route('/current_user/config', methods=['GET', 'POST'])
@login_required
def current_user_config():
    if request.method == 'GET':
        response = {"api_key": current_user.api_key, "api_url": current_user.api_url}
        return jsonify(response)
    elif request.method == 'POST':
        data = request.get_json(silent=True)

        if "api_key" not in data:
            return abort(400)
        if "api_url" not in data:
            return abort(400)

        user = User.query.get(current_user.id)
        user.api_key = data["api_key"]
        user.api_url = data["api_url"]
        db.session.commit()

        return "200"


@app.route('/current_user/toys/get', methods=['GET'])
@login_required
def current_user_toys_get():
    if request.method == 'GET':
        user_toys = Toy.query.filter_by(user_id=current_user.id).all()
        response = []
        for toy in user_toys:
            response.append({"description" : toy.description, "id": toy.id, "mac_address": toy.mac_address})
        return jsonify(response)


@app.route('/current_user/toys/new', methods=['POST'])
@login_required
def current_user_toys_new():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "mac_address" not in data:
            return abort(400)
        if "description" not in data:
            return abort(400)
        
        mac_address = data["mac_address"]
        description = data["description"]

        # Verifica brinquedo
        toy = Toy.query.filter_by(mac_address=mac_address).first()
        if toy is not None:
            return jsonify({"status": 404, "msg": "Código de brinquedo já cadastrado"})

        toy = Toy(mac_address=mac_address, description=description, user_id=current_user.id)
        db.session.add(toy)
        db.session.commit()

        return jsonify({"status": 200})


@app.route('/current_user/toys/edit', methods=['POST'])
@login_required
def current_user_toys_edit():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "id" not in data:
            return abort(400)
        if "mac_address" not in data:
            return abort(400)
        if "description" not in data:
            return abort(400)
        
        toy_id = data["id"]
        mac_address = data["mac_address"]
        description = data["description"]

        # Verifica brinquedo para editar as informações
        toy = Toy.query.get(toy_id)
        if toy is None:
            return jsonify({"status": 404, "msg": "Brinquedo não encontrado"})

        toy.mac_address = mac_address
        toy.description = description
        db.session.commit()

        return jsonify({"status": 200})


@app.route('/current_user/toys/del', methods=['POST'])
@login_required
def current_user_toys_del():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "id" not in data:
            return abort(400)
        
        toy_id = data["id"]

        # Verifica brinquedo para editar as informações
        toy = Toy.query.get(toy_id)
        if toy is None:
            return jsonify({"status": 404, "msg": "Brinquedo não encontrado"})

        db.session.delete(toy)
        db.session.commit()

        return jsonify({"status": 200})


@app.route('/current_user/dicas/get', methods=['GET'])
@login_required
def current_user_dicas_get():
    if request.method == 'GET':
        user_dicas = Dica.query.filter_by(user_id=current_user.id).all()
        response = []
        for dica in user_dicas:
            response.append({"description" : dica.description, "id": dica.id})
        return jsonify(response)


@app.route('/current_user/dicas/new', methods=['POST'])
@login_required
def current_user_dicas_new():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "description" not in data:
            return abort(400)
        
        description = data["description"]

        # Verifica brinquedo
        dica = Dica.query.filter_by(description=description).first()
        if dica is not None:
            return jsonify({"status": 404, "msg": "Descrição já cadastrado"})

        dica = Dica(description=description, user_id=current_user.id)
        db.session.add(dica)
        db.session.commit()

        return jsonify({"status": 200})


@app.route('/current_user/dicas/edit', methods=['POST'])
@login_required
def current_user_dicas_edit():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "id" not in data:
            return abort(400)
        if "description" not in data:
            return abort(400)
        
        dica_id = data["id"]
        description = data["description"]

        # Verifica brinquedo para editar as informações
        dica = Dica.query.get(dica_id)
        if dica is None:
            return jsonify({"status": 404, "msg": "Dica não encontrada"})

        dica.description = description
        db.session.commit()

        return jsonify({"status": 200})


@app.route('/current_user/dicas/del', methods=['POST'])
@login_required
def current_user_dicas_del():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "id" not in data:
            return abort(400)
        
        dica_id = data["id"]

        # Verifica brinquedo para editar as informações
        dica = Dica.query.get(dica_id)
        if dica is None:
            return jsonify({"status": 404, "msg": "Dica não encontrada"})

        db.session.delete(dica)
        db.session.commit()

        return jsonify({"status": 200})


# Home route
@app.route('/transformar', methods=['GET'])
@app.route('/biblioteca', methods=['GET'])
@app.route('/brinquedos', methods=['GET'])
@app.route('/dicas', methods=['GET'])
@app.route('/config', methods=['GET'])
@login_required
def home():
    return render_template('index.html') 


@app.route('/text_to_speech/post', methods=['POST'])
@login_required
def text_to_speech_post(): 
    if request.method == 'POST':
        data = request.get_json(silent=True)
        
        if "input_tts" not in data:
            return abort(400)
        if "list_part" not in data:
            return abort(400)
        if "toy" not in data:
            return abort(400)

        text = request.json['input_tts']
        list_part = request.json['list_part']
        selected_toy = request.json['toy']
        ofensive_file = open(app.config['OFENSIVE_FILE'], "r")
        ofensive_list = ofensive_file.read().splitlines()

        # Verifica palavras ofensivas
        for word in ofensive_list:
            if word.upper() in text.upper():
                print('Palavra ofensiva: ' + word)
                return jsonify({"status": "100", "word": word})  

        # Verifica se o brinquedo existe
        toy = Toy.query.get(selected_toy)
        if not toy:
           return abort(500) 

        # Inicia a classe do Watson TTS
        tts = WatsonTTS(current_user.api_key, current_user.api_url)

        if not tts:
            return abort(500)

        # Cria um arquivo de áudio para cada parte selecionada
        for part in list_part:
            try:
                # Cria o content pelo serviço da IBM
                content = tts.create(text)
                if content is None:
                    raise Exception('Erro ao gerar os sons pelo content ser None')
                
                # Criar o arquivo em disco
                file_name = str(toy.id) + str(part) + datetime.now().strftime("%d%m%Y%H%M%S")
                file_sound = SoundTTS(file_name, content).create()
                
                if file_sound:
                    sound = Sound.query.filter_by(part=part, toy_id=toy.id).first()
                    if not sound:
                        # Criar o som na base se ele nao existir ainda
                        sound = Sound(file_name=file_name, part=part, toy_id=selected_toy)
                        db.session.add(sound)
                        db.session.commit()
                    else:
                        # Delete nos arquivos antigos
                        if os.path.exists(app.config['SOUNDS_URL'] + '/{}.wav'.format(sound.file_name)):
                            os.remove(app.config['SOUNDS_URL'] + '/{}.wav'.format(sound.file_name))
                        sound.file_name = file_name
                        db.session.commit()
                else:
                    raise Exception('Erro ao gerar os sons')
            except Exception as e:
                print(e)
                return abort(500)
        
        return jsonify({"status": "200"})

    
@app.route('/text_to_speech/list', methods=['GET', 'POST'])
@login_required
def text_to_speech_list(): 
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if "toy" not in data:
            return abort(400)
        selected_toy = request.json['toy']

        sounds = Sound.query.filter_by(toy_id=selected_toy).all()
        response = []
        
        for sound in sounds:
            response.append(sound.file_name)
        
        return jsonify(response)

    elif request.method == 'GET':
        response = []
        toys = Toy.query.filter_by(user_id=current_user.id).all()
        for toy in toys:
            sounds = Sound.query.filter_by(toy_id=toy.id).all()
            medias = []
            for sound in sounds:
                medias.append({
                    "file_name": sound.file_name,
                    "sound_url": url_for('static', filename='sounds/{}.wav'.format(sound.file_name)),
                    "img_url": url_for('static', filename='img/{}.png'.format(sound.part))
                })
            response.append({
                    "id": toy.id,
                    "description": toy.description,
                    "media": medias
                })
        return jsonify(response)
    
