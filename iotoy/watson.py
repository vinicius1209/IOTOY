from ibm_watson import TextToSpeechV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

class WatsonTTS():

    def __init__(self, api_key, api_url):
        self.api_key = api_key
        self.api_url = api_url
        self.authenticator = IAMAuthenticator(self.api_key)
        self.text_to_speech = TextToSpeechV1(authenticator=self.authenticator)
        self.text_to_speech.set_service_url(self.api_url)

    def create(self, text):
        try:
            content = self.text_to_speech.synthesize(text, voice='pt-BR_IsabelaV3Voice', accept='audio/wav').get_result().content
            return content
        except Exception as ex:
            print('Erro ao criar o som em watson.py: {}'.format(ex))
            return None  

