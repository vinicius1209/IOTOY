from iotoy import app
import os, sys

class SoundTTS():

    def __init__(self, name, content):
        self.name = name
        self.content = content

    def create(self):
        try:
            with open(app.config['SOUNDS_URL'] + '/{}.wav'.format(self.name), os.O_RDWR|os.O_CREAT ) as audio_file:
                audio_file.write(
                    self.content
                )
            audio_file.close()
            return True
        except Exception as ex:
            print('Erro ao criar o arquivo de áudio em sounds.py: {}'.format(ex))
            return False  

