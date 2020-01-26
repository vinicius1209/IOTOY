from iotoy import app
import wave
import numpy as np

class SoundTTS():

    def __init__(self, name, content, change_sound):
        self.name = name
        self.content = content
        self.change_sound = change_sound

    def create(self):
        try:
            
            if self.change_sound:
            
                with open(app.config['SOUNDS_URL'] + '/temp_{}.wav'.format(self.name), 'wb') as audio_file:
                    audio_file.write(
                        self.content
                    )
                audio_file.close()

                self.to_highpitch(
                    str(app.config['SOUNDS_URL'] + '/temp_{}.wav'.format(self.name)),
                    str(app.config['SOUNDS_URL'] + '/{}.wav'.format(self.name))
                )
            else:
                with open(app.config['SOUNDS_URL'] + '/{}.wav'.format(self.name), 'wb') as audio_file:
                    audio_file.write(
                        self.content
                    )
                audio_file.close()             

            return True
        except Exception as ex:
            print('Erro ao criar o arquivo de áudio em sounds.py: {}'.format(ex))
            return False
    
    def to_highpitch(self, src_file, out_file, shift=400):
        wr = wave.open(src_file, mode='r')
        pars = list(wr.getparams())
        pars[3] = 0
        pars = tuple(pars)
        ww = wave.open(out_file, mode='w')
        ww.setparams(pars)

        fr = 30
        sz = wr.getframerate() // fr  # Read and process 1/fr second at a time.

        # A larger number for fr means less reverb.
        c = int(wr.getnframes()/sz)  # count of the whole file

        shift = shift // fr  # shifting 100 Hz

        for num in range(c):
            da = np.fromstring(wr.readframes(sz), dtype=np.int16)
            # print('Shape:', da.shape, da[0::1].shape, da[1::2].shape)
            if da.shape[0] == 0:
                continue
            da = np.fft.rfft(da)
            da = np.roll(da, shift)
            da[0:shift] = 0
            da = np.fft.irfft(da)
            ns = da.ravel().astype(np.int16)
            ww.writeframes(ns.tostring())
        wr.close()
        ww.close()

