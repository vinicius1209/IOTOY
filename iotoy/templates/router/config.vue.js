const Config = {
    template: `
    <v-container fluid grid-list-md>
        <v-layout row wrap>
            <v-flex lg8 md8 xs12>
                <v-card class="elevation-3">
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field v-model="api_key" :rules="api_keyRules" label="Api Key"></v-text-field>
                            <v-text-field v-model="api_url" :rules="api_urlRules" label="URL"></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="success" @click="set_user_config">Salvar</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
            <v-flex lg4 md4 xs12>
                <v-card class="elevation-3">
                    <v-card-title primary-title>
                        <div>
                            <h3 class="headline mb-0">Plano Lite</h3>
                            <div>10.000 caracteres por mês</div>
                        </div>
                    </v-card-title>
                    <v-card-actions>
                        <v-btn color="info" href="https://cloud.ibm.com/services/text-to-speech" target="_blank"> Gerenciar </v-btn>
                    </v-card-actions>
                </v-card>     
            </v-flex>
        </v-layout>
    </v-container>
     `,
    data() {
        return {
            valid: true,
            api_key: null,
            api_keyRules: [
                v => !!v || 'É necessário preencher a Api Key'
            ],
            api_url: null,
            api_urlRules: [
                v => !!v || 'É necessário preencher a URL'
            ]
        }
    },
    mounted() {
        this.get_user_config()
    },
    methods: {
        get_user_config() {
            axios
                .get("https://iotoy.herokuapp.com/current_user/config")
                .then(
                    response => (
                        this.api_key = response.data.api_key,
                        this.api_url = response.data.api_url
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
                        "https://iotoy.herokuapp.com/current_user/config",
                        {
                            api_key: this.api_key,
                            api_url: this.api_url
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
