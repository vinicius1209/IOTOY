from iotoy import app

class SoundTTS():

    def __init__(self, name, content):
        self.name = name
        self.content = content

    def create(self):
        try:
            print(app.config['SOUNDS_URL'] + '{}.wav'.format(self.name))
            with open(app.config['SOUNDS_URL'] + '{}.wav'.format(self.name), 'wb') as audio_file:
                audio_file.write(
                    self.content
                )
            audio_file.close()
            return True
        except Exception as ex:
            print('Erro ao criar o arquivo de áudio em sounds.py: {}'.format(ex))
            return False  

