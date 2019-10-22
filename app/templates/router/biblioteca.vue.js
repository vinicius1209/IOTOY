const Biblioteca = {
    template: `
    <v-container fluid grid-list-md>
        <v-layout row wrap>
            <v-flex>
                <v-stepper v-model="view">
                    <v-stepper-header>
                    <v-stepper-step :complete="view > 1" step="1">Brinquedo</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step :complete="view > 2" step="2">Reprodução</v-stepper-step>
                    </v-stepper-header>
                    <v-stepper-items>
                    <!-- BRINQUEDO -->
                    <v-stepper-content step="1">
                        <v-card flat>
                            <v-card-text>
                                <v-combobox
                                    v-model="select_toy"
                                    :items="list_toy"
                                    item-value="id"
                                    item-text="description"
                                    label="Selecione o brinquedo"
                                    ref="toy_field"
                                    >
                                </v-combobox>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn color="primary" @click="to_next_view()" style="margin: 0px 0px;">Próximo</v-btn>
                            </v-card-actions>
                        </v-card>
                        </v-stepper-content>
                        <!-- Reprodução -->
                        <v-stepper-content step="2">
                            <v-card>
                                <v-card-text>
                                    <v-layout row wrap> 
                                        <v-flex lg3 md4 xs6 v-for="sound in select_toy.media" :key="sound.file_name">
                                            <v-hover>
                                                <v-card slot-scope="{ hover }" :class="card_elevation(hover)" class="mx-auto">
                                                    <v-img :src="sound.img_url" height="200px"></v-img>
                                                    <v-card-text
                                                        class="pt-4"
                                                        style="position: relative;"
                                                    >
                                                        <audio controls ref="player">
                                                            <source :src="sound.sound_url" type="audio/wav">
                                                        </audio>
                                                        </v-btn>
                                                    </v-card-text>
                                                    <v-card-actions>
                                                        <v-btn flat color="success" @click="send_sound_toy(sound)">Enviar</v-btn>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-hover>
                                        </v-flex>                  
                                    </v-layout>
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn flat @click="view = 1">Voltar</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
            </v-flex>
        </v-layout>
    </v-container>
     `,
    data() {
        return {
            view: 0,
            list_toy: [],
            select_toy: {
                id: '',
                description: '',
                media: []
            },
            sound_data: null
        }
    },
    mounted() {
        this.get_list_toy_sounds()
    },
    methods: {
        card_elevation(hover){
            if (hover){
                return 'elevation-12'
            }else{
                return 'elevation-2'
            }
        },
        to_next_view() {
            if (this.select_toy == null) {
                home.$refs.notification.makeNotification('warning', 'É necessário selecionar algum brinquedo!')
                this.$refs.toy_field.focus()
            } else {
                this.view = 2
            }
        },
        get_list_toy_sounds() {
            var vm = this
            home.$refs.loading.start()
            axios
                .get("http://10.70.15.24:5000/text_to_speech/list")
                .then(function (response) {
                    response.data.forEach(item => {
                        vm.list_toy.push(
                            {
                                "id": item.id,
                                "description": item.description,
                                "media": item.media
                            }
                        )
                    })
                    home.$refs.loading.stop()
                })
                .catch(error => {
                    home.$refs.loading.stop()
                    console.log(error)
                });
        },
        send_sound_toy(sound_obj){   
            home.$refs.loading.start()
            let origin = window.location.origin
            let file_name = sound_obj.file_name + '.wav'
            console.log(this.select_toy)
            axios
            .post(
                "http://192.168.0.108:5000/iotoy/back",
                {
                    url: origin + sound_obj.sound_url,
                    file_name: file_name
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )
            .then(function (response) {
                home.$refs.notification.makeNotification('success', 'Fala enviada ao brinquedo :)')
                home.$refs.loading.stop()
            })
            .catch(error => {
                console.log(error)
                home.$refs.notification.makeNotification('error', 'Houve um problema ao enviar a fala ao briquedo :(')
                home.$refs.loading.stop()
            });
         
        }
    }
}
