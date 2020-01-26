const Config = {
    template: `
    <v-container fluid grid-list-md>
        <v-layout row wrap>
            <v-flex lg12 md12 xs12>
                <v-toolbar flat color="white">
                    <v-toolbar-title>Parâmetros do IOTOY</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn flat color="success" @click="set_user_config">Salvar</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
            </v-flex>
            <v-flex lg6 md12 xs12>
                <v-card flat>
                    <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Plano Lite</h3>
                        <div>10.000 caracteres por mês</div>
                    </div>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field v-model="api_key" :rules="api_keyRules" label="Api Key"></v-text-field>
                            <v-text-field v-model="api_url" :rules="api_urlRules" label="URL"></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn flat color="info" href="https://cloud.ibm.com" target="_blank"> IBM Cloud </v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
            <v-flex lg6 md12 xs12>
                <v-card flat>
                    <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Geração das falas</h3>
                    </div>
                    </v-card-title>
                    <v-card-text>
                        <v-switch v-model="robotic_sound" label="Habilitar voz robótica"></v-switch>
                    </v-card-text>
                </v-card>
            </v-flex>

            <v-dialog v-model="dialog_robotc" persistent max-width="290">
                <v-card>
                    <v-card-title class="headline">Aviso</v-card-title>
                    <v-card-text>
                        O parâmetro "Voz robótica" está habilitado.
                        Portanto o tempo de resposta da geração de falas
                        será maior do que o normal.
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1" flat @click="dialog_robotc = false">Entendi</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

        </v-layout>
    </v-container>
     `,
    data() {
        return {
            dialog_robotc: false,
            valid: true,
            api_key: null,
            api_keyRules: [
                v => !!v || 'É necessário preencher a Api Key'
            ],
            api_url: null,
            api_urlRules: [
                v => !!v || 'É necessário preencher a URL'
            ],
            robotic_sound: false
        }
    },
    mounted() {
        this.get_user_config()
    },
    watch:{
        robotic_sound: function (val) {
            this.robotic_sound = val
            if (val == true){
                this.dialog_robotc = true
            }
        }
    },
    methods: {
        get_user_config() {
            axios
                .get("/current_user/config")
                .then(
                    response => (
                        this.api_key = response.data.api_key,
                        this.api_url = response.data.api_url,
                        this.robotic_sound = response.data.robotic_sound
                    )
                )
                .catch(error => {
                    console.log(error)
                    home.$refs.notification.makeNotification('error', 'Houve um erro ao buscar as configurações')
                });
        },
        set_user_config() {
            if (this.$refs.form.validate()) {
                axios
                    .post(
                        "/current_user/config",
                        {
                            api_key: this.api_key,
                            api_url: this.api_url,
                            robotic_sound: this.robotic_sound
                        },
                        {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    )
                    .then(function (response) {
                        home.$refs.notification.makeNotification('success', 'Configurações salvas com sucesso')
                    })
                    .catch(error => {
                        console.log(error);
                        home.$refs.notification.makeNotification('error', 'Houve um erro ao salvar as configurações')
                    });
            }
        }
    }
}
