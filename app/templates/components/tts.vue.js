Vue.component('tts-card', {
    template: `
    <div id="tts">
        <v-card class="elevation-12">
            <v-card-title primary-title>
                <v-layout  row wrap>
                    <v-flex lg12 md12 xs12>
                        <h3 class="headline mb-0">Texto em Fala</h3>
                        <div>Selecione o brinquedo, e qual membro para enviar o áudio gerado</div>                    
                    </v-flex>
                    <v-flex lg12 md12 xs12>
                        <v-select
                        v-model="selectedItems"
                        :items="items"
                        item-value="value"
                        attach
                        chips
                        label="Selecione o brinquedo"
                        multiple
                        ></v-select>
                    </v-flex>
                    <v-flex lg12 md12 xs12>
                        <v-select
                        v-model="selectedItems"
                        :items="items"
                        item-value="value"
                        attach
                        chips
                        label="Selecione o membro"
                        multiple
                        ></v-select>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-textarea
                    name="input_to_tts"
                    box
                    label="Digite o texto"
                    rows="3"
                    auto-grow
                    v-model="input_tts"
                    counter="280"
                ></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="request_tts()"> Transformar </v-btn>
            </v-card-actions>
        </v-card>   
    </div>
    `,
    data() {
        return {
            input_tts: "",
            items: [
                { text: 'Braço direito', value: 'braco_direito' },
                { text: 'Braço esquerdo', value: 'braco_esquerdo' },
                { text: 'Perna direita', value: 'perna_direita' },
                { text: 'Perna esquerda', value: 'perna_esquerda' }
            ],
            selectedItems: [],
            isPlaying: false,
            current: 0
        }
    },
    methods: {

        request_tts() {

            if (this.selectedItems.length <= 0) {
                home.$refs.notification.makeNotification('warning', 'É necessário selecionar algum tipo!')
                return
            }

            if (this.input_tts == "") {
                home.$refs.notification.makeNotification('warning', 'É necessário escrever algum texto!')
                return
            }

            home.$refs.loading.start()
            axios
                .post(
                    "http://127.0.0.1:5000/text_to_speech/post",
                    {
                        input_tts: this.input_tts,
                        selection: this.selectedItems
                    },
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
                .then(function (response) {
                    home.$refs.loading.stop()
                    home.$refs.notification.makeNotification('success', 'Áudio gerado com sucesso!')
                })
                .catch(error => {
                    home.$refs.loading.stop()
                    home.$refs.notification.makeNotification('error', 'Erro ao transformar o texto!')
                    console.log(error)
                });
        }

    }
})