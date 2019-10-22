const Toys = {
    template: `
    <v-container fluid grid-list-md>
        <v-layout row wrap>
            <v-flex lg12 md12 xs12>
                <v-toolbar flat color="white">
                    <v-toolbar-title>Listagem de Brinquedos</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn flat color="success" @click="dialog = true">Novo</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
            </v-flex>
            <v-flex lg12 md12 xs12>
                <v-data-table
                    :headers="headers"
                    :items="list_toy"
                    class="elevation-1"
                    >
                    <template v-slot:items="props">
                        <td>{{ props.item.mac_address }}</td>
                        <td>{{ props.item.description }}</td>
                        <td>
                            <v-icon small class="mr-2" @click="editItem(props.item)">
                                edit
                            </v-icon>
                            <v-icon small @click="deleteItem(props.item)">
                                delete
                            </v-icon>
                        </td>
                    </template>
                </v-data-table>
            </v-flex>

            <!-- Dialogo de edição -->
            <v-dialog v-model="dialog" max-width="500px">
                <v-card class="elevation-3">
                    <v-card-title>
                        <span class="headline">{{ formTitle }}</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field v-model="editedItem.mac_address" label="Código do Brinquedo" prepend-icon="face" :rules="macRules" :counter="17" required></v-text-field>
                            <v-text-field v-model="editedItem.description" label="Descrição" prepend-icon="info" :rules="descriptionRules" :counter="30" required></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click="close">Cancelar</v-btn>
                        <v-btn color="success" flat @click="saveItem()">Salvar</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Dialogo de remoção -->
            <v-dialog v-model="dialog_del" persistent max-width="350">
                <v-card>
                <v-card-title class="headline">Remover brinquedo</v-card-title>
                <v-card-text>Tem certeza de que deseja remover o brinquedo selecionado?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click="close">Cancelar</v-btn>
                    <v-btn color="red darken-1" flat @click="saveItem()">Confirmar</v-btn>
                </v-card-actions>
                </v-card>
            </v-dialog>            
        </v-layout>
    </v-container>
     `,
    data() {
        return {
            dialog: false,
            dialog_del: false,
            valid: true,
            mac_address: '',
            description: '',
            macRules: [
                v => !!v || 'É necessário preencher o Código do brinquedo',
                v => v.length <= 17 || 'Código do brinquedo deve possuir até 17 characters',
                v => /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/.test(v) || 'Formato de Código inválido'
            ],
            descriptionRules: [
                v => !!v || 'É necessário preencher a Descrição do brinquedo',
                v => v.length <= 30 || 'Descrição do brinquedo deve possuir até 30 characters'
            ],
            headers: [
                { text: 'Código', value: 'mac_address' },
                { text: 'Descrição', value: 'description' },
                { text: 'Ações', value: 'name', sortable: false }
            ],
            list_toy: [],
            deletedIndex: -1,
            deletedItem:{
                id: '',
                mac_address: '',
                description: ''
            },
            editedIndex: -1,
            editedItem: {
                id: '',
                mac_address: '',
                description: ''
            },
            defaultItem: {
                id: '',
                mac_address: '',
                description: ''
            }
        }
    },
    mounted() {
        this.get_list_toys()
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Novo Brinquedo' : 'Editar Brinquedo'
        }
    },
    watch: {
        dialog(val) {
            val || this.close()
        },
        dialog_del(val) {
            val || this.close()
        }
    },
    methods: {
        get_list_toys() {
            axios
                .get("https://iotoy.herokuapp.com/current_user/toys/get")
                .then(
                    response => (
                        this.list_toy = [],
                        response.data.forEach(item => {
                            this.list_toy.push(
                                {
                                    "id": item.id,
                                    "description": item.description,
                                    "mac_address": item.mac_address
                                }
                            )
                        }
                        )
                    )
                )
                .catch(error => {
                    console.log(error)
                });
        },
        editItem(item) {
            this.editedIndex = this.list_toy.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem(item) {
            this.deletedIndex = this.list_toy.indexOf(item)
            this.deletedItem = Object.assign({}, item)
            this.dialog_del = true
        },
        saveItem() {
            var vm = this
            // Remover brinquedo
            if (this.deletedIndex > -1) {
                home.$refs.loading.start()
                axios
                    .post(
                        "https://iotoy.herokuapp.com/current_user/toys/del",
                        {
                            id: this.deletedItem.id
                        },
                        {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    )
                    .then(function (response) {
                        if (response.data.status == "200") {
                            home.$refs.loading.stop()
                            home.$refs.notification.makeNotification('success', 'Brinquedo removido com sucesso!')
                            vm.get_list_toys()
                            vm.dialog_del = false
                        } else {
                            login.$refs.notification.makeNotification('warning', response.data.msg)
                        }
                    })
                    .catch(error => {
                        home.$refs.loading.stop()
                        home.$refs.notification.makeNotification('error', 'Erro ao editar o brinquedo!')
                        console.log(error)
                    });
            } else {
                // Se tudo estiver validado
                if (this.$refs.form.validate()) {
                    if (this.editedIndex > -1) {
                        // Editando
                        home.$refs.loading.start()
                        axios
                            .post(
                                "https://iotoy.herokuapp.com/current_user/toys/edit",
                                {
                                    id: this.editedItem.id,
                                    mac_address: this.editedItem.mac_address,
                                    description: this.editedItem.description
                                },
                                {
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                }
                            )
                            .then(function (response) {
                                if (response.data.status == "200") {
                                    home.$refs.loading.stop()
                                    home.$refs.notification.makeNotification('success', 'Brinquedo editado com sucesso!')
                                    vm.get_list_toys()
                                    vm.dialog = false
                                } else {
                                    login.$refs.notification.makeNotification('warning', response.data.msg)
                                }
                            })
                            .catch(error => {
                                home.$refs.loading.stop()
                                home.$refs.notification.makeNotification('error', 'Erro ao editar o brinquedo!')
                                console.log(error)
                            });
                    } else {
                        // Novo item
                        home.$refs.loading.start()
                        axios
                            .post(
                                "https://iotoy.herokuapp.com/current_user/toys/new",
                                {
                                    mac_address: this.editedItem.mac_address,
                                    description: this.editedItem.description
                                },
                                {
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                }
                            )
                            .then(function (response) {
                                if (response.data.status == "200") {
                                    home.$refs.loading.stop()
                                    home.$refs.notification.makeNotification('success', 'Brinquedo cadastrado com sucesso!')
                                    vm.get_list_toys()
                                    vm.dialog = false
                                } else {
                                    login.$refs.notification.makeNotification('warning', response.data.msg)
                                }
                            })
                            .catch(error => {
                                home.$refs.loading.stop()
                                home.$refs.notification.makeNotification('error', 'Erro ao cadastrar o brinquedo!')
                                console.log(error)
                            });
                    }
                }
            }
        },
        close() {
            this.dialog = false
            this.dialog_del = false
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.deletedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
                this.deletedIndex = -1
            }, 300)
        }
    }
}
