Vue.component('side-menu', {
    template: `
    <div id="menu">
    <v-navigation-drawer v-model="drawer" fixed app width="250">
      <v-list class="pt-0">
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <img src="https://randomuser.me/api/portraits/men/85.jpg">
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ current_user }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-list class="pt-0" dense>
        <v-divider></v-divider>

        <v-list-group
          prepend-icon="library_music"
          value="true"
        >
        <template v-slot:activator>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Falas</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>

        <v-list-tile to="/transformar">
          <v-list-tile-action>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Criar</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

         <v-list-tile to="/biblioteca">
          <v-list-tile-action>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Biblioteca</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list-group>
      
        <v-list-tile to="/brinquedos">
        <v-list-tile-action>
          <v-icon>face</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Brinquedos</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

        <v-list-tile to="/config">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Configurações</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="dialog = true">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Sair</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>


      </v-list>
    </v-navigation-drawer>
    <v-toolbar  color="cyan" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>IOTOY</v-toolbar-title>
    </v-toolbar>

    <v-dialog v-model="dialog" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Sair do IOTOY</v-card-title>
        <v-card-text>Voce será redirecionado para a tela de Login.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click="dialog = false">Cancelar</v-btn>
          <v-btn color="green darken-1" flat @click="doLogout()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
    `,
    data() {
        return {
            dialog: false,
            current_user: "Default",
            drawer: null
        }
    },
    mounted() {
        this.getLoggedUser()
    },
    methods: {
        doLogout() {
            axios
                .get(
                    "https://iotoy.herokuapp.com/logout",
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
                .then(function (response) {
                    window.location = response.data.redirect
                })
                .catch(error => {
                    login.$refs.notification.makeNotification('error', 'Erro ao efetuar logout')
                });
        },
        getLoggedUser() {
            var vm = this
            axios
                .get(
                    "https://iotoy.herokuapp.com/current_user/info",
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                )
                .then(function (response) {
                    vm.current_user = response.data;
                })
                .catch(error => {
                    login.$refs.notification.makeNotification('warning', 'Erro ao buscar informações do usuário')
                });
        }
    }
})