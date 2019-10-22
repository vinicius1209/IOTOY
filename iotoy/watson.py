from ibm_watson import TextToSpeechV1

class WatsonTTS():

    def __init__(self, api_key, api_url):
        self.api_key = api_key
        self.api_url = api_url
        self.text_to_speech = TextToSpeechV1(iam_apikey=self.api_key, url=self.api_url)

    def create(self, text):
        try:
            content = self.text_to_speech.synthesize(text, voice='pt-BR_IsabelaVoice', accept='audio/wav').get_result().content
            return content
        except Exception as ex:
            print('Erro ao criar o som em watson.py: {}'.format(ex))
            return None  

