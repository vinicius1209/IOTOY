var login = new Vue({
    el: '#login',
    data() {
        return {
            drawer: null,
            view: "tab-login",
            login_form: {
                username: "",
                password: "",
                rules: {
                    usernameRules: [
                        v => !!v || 'É necessário preencher o Usuário',
                        v => v.length <= 64 || 'Usuário deve possuir até 64 characters'
                    ],
                    passwordRules: [
                        v => !!v || 'É necessário preencher a Senha'
                    ]
                }
            },
            signup_form: {
                username: "",
                password: "",
                email: "",
                mac_address: "",
                description: "",
                rules: {
                    usernameRules: [
                        v => !!v || 'É necessário preencher o Usuário',
                        v => v.length <= 64 || 'Usuário deve possuir até 64 characters'
                    ],
                    passwordRules: [
                        v => !!v || 'É necessário preencher a Senha'
                    ],
                    repasswordRules: [
                        v => !!v || 'É necessário confirmar a Senha',
                        v => v == this.signup_form.password || 'As senhas devem ser iguais'
                    ],
                    macRules: [
                        v => !!v || 'É necessário preencher o Código do brinquedo',
                        v => v.length <= 17 || 'Código do brinquedo deve possuir até 17 characters',
                        v => /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/.test(v) || 'Formato de Código inválido'
                    ],
                    descriptionRules: [
                        v => !!v || 'É necessário preencher a Descrição do brinquedo',
                        v => v.length <= 30 || 'Descrição do brinquedo deve possuir até 30 characters'
                    ],
                    emailRules: [
                        v => !!v || 'É necessário preencher o E-mail',
                        v => /.+@.+/.test(v) || 'Formato de E-mail inválido'
                    ]
                }
            },
            valid: false
        }
    },
    props: {
        source: String
    },
    methods: {
        doLogin() {
            if (this.$refs.login_form.validate()) {
                axios
                    .post(
                        "/login",
                        {
                            username: this.login_form.username,
                            password: this.login_form.password
                        },
                        {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    )
                    .then(function (response) {
                        if (response.data.status == "200"){
                            window.location = response.data.redirect
                        }else{
                            login.$refs.notification.makeNotification('warning', response.data.msg) 
                        }
                    })
                    .catch(error => {
                        login.$refs.notification.makeNotification('error', 'Erro ao efetuar o login do usuário')
                    });
            }
        },
        doSignup() {
            if (this.$refs.signup_form.validate()) {
                var vm = this
                axios
                    .post(
                        "/signup",
                        {
                            username: this.signup_form.username,
                            password: this.signup_form.password,
                            email: this.signup_form.email,
                            mac_address: this.signup_form.mac_address,
                            description: this.signup_form.description
                        },
                        {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    )
                    .then(function (response) {
                        if (response.data.status == "200"){
                            login.$refs.notification.makeNotification('success', 'Registro efetuado com sucesso')  
                            vm.view = "tab-login"
                        }else{
                            login.$refs.notification.makeNotification('warning', response.data.msg) 
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        login.$refs.notification.makeNotification('error', 'Erro ao efetuar o registro de usuário')
                    });
            }
        }
    }
})