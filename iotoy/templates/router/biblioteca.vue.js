const Biblioteca = {
    template: `
    <v-container fluid grid-list-md>
        <v-layout row wrap>
        <v-flex>
            <v-card>
            <v-card-text>
                <v-layout row wrap>
                <v-flex lg12 md12 xs12>
                    <v-combobox
                        v-model="select_toy"
                        :items="list_toy"
                        item-value="id"
                        item-text="description"
                        label="Selecione o brinquedo"
                        ref="toy_field"
                    ></v-combobox>
                </v-flex>
                <v-flex lg3 md4 xs6 v-for="sound in select_toy.media" :key="sound.file_name">
                    <v-hover>
                    <v-card slot-scope="{ hover }" :class="card_elevation(hover)" class="mx-auto">
                        <v-img :src="sound.img_url" height="200px"></v-img>
                        <v-card-text class="pt-4" style="position: relative;">
                        <audio controls ref="player">
                            <source :src="sound.sound_url" type="audio/wav" />
                        </audio>
                        </v-card-text>
                    </v-card>
                    </v-hover>
                </v-flex>
                </v-layout>
            </v-card-text>
            </v-card>
        </v-flex>
        </v-layout>
    </v-container>
     `,
    data() {
        return {
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
        get_list_toy_sounds() {
            var vm = this
            home.$refs.loading.start()
            axios
                .get("/text_to_speech/list")
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
                    this.select_toy = this.list_toy[0]
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
            axios
            .post(
                "https://192.168.0.108:5000/iotoy/back",
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
