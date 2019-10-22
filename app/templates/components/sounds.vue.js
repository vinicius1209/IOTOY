Vue.component('sounds-card', {
    template: `
    <div id="sounds">
        <v-card class="elevation-12">
            <v-card-title primary-title>
            <div>
                <h3 class="headline mb-0">Sons Cadastrados</h3>
                <div>Clique para reproduzir</div>
            </div>
            </v-card-title>
            <v-card-text>
                <div class="text-xs-center">

                    <v-chip 
                        v-for="item in items" 
                        v-bind:key="item.value" 
                        color="green" 
                        text-color="white"
                        @click="request_tts(item.value)"
                        >
                        {{ item.text }}
                    </v-chip>

                </div>
            </v-card-text>
            <v-card-actions>
                <v-layout>
                    <v-flex lg12 md12 xs12>
                        <audio ref="player">
                            <source src="" type="audio/wav">
                        </audio>
                        <v-progress-linear
                            background-color="grey lighten-2"
                            color="red darken-1"
                            v-model="current">
                        </v-progress-linear>
                    </v-flex>
                </v-layout>
            </v-card-actions>
        </v-card>    
    </div>
    `,
    mounted() {
        this.get_sound_list();
    },
    data() {
        return {
            current: 0,
            isPlaying: false,
            responseData: null,
            items: []
        }
    },
    methods: {
        get_sound_list() {
            axios
                .get("http://127.0.0.1:5000/text_to_speech/list")
                .then(
                    response => (
                        ((this.responseData = response.data),
                            this.responseData.forEach(item => {
                                this.items.push({
                                    text: item.text,
                                    value: item.value
                                });
                            }))
                    ),
                )
                .catch(error => {
                    console.log(error)
                    home.$refs.notification.makeNotification('error', 'Houve um erro ao buscar a lista de sons')
                });
        },
        request_tts(value) {

            home.$refs.loading.start()

            // Inicializa o XML HTTP Request
            var url = "http://127.0.0.1:5000/text_to_speech/get"
            var xhr = new XMLHttpRequest()
            xhr.open('POST', encodeURI(url), true)
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.responseType = 'blob'
            var vm = this

            xhr.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    var blob = new Blob([xhr.response], { type: 'audio/wav' })
                    var objectUrl = URL.createObjectURL(blob)
                    var audio_player = vm.$refs.player
                    audio_player.src = objectUrl

                    // Depois de carregar o src
                    audio_player.onloadeddata = function (evt) {
                        URL.revokeObjectURL(objectUrl)            
                    }
                    // Ao iniciar o som
                    audio_player.onplay = function () {
                        vm.isPlaying = true
                    }
                    // Quando parar de tocar o som
                    audio_player.onpause = function () {
                        vm.isPlaying = false
                        vm.current = 0
                    }
                    // A cada mudança no tempo atual do som
                    audio_player.ontimeupdate = function () {
                        vm.current = parseInt((audio_player.currentTime * 100) / audio_player.duration) + 30
                    }
                    home.$refs.loading.stop()
                    audio_player.play()
                }
            }
            //Parametros
            var data = JSON.stringify({
                selected: [value]
            });
            //Envia pro flask
            xhr.send(data)
        }
    }
})