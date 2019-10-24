const TTS = {
  template: `
  <v-container fluid grid-list-md>
  <v-card flat>
    <v-card-text>
      <v-layout row wrap>
        <v-flex lg6 md6 xs12>
          <v-combobox
            v-model="select_toy"
            :items="list_toy"
            item-value="id"
            item-text="text"
            label="Selecione o brinquedo"
            ref="toy_field"
          ></v-combobox>
          <v-select
            v-model="select_part"
            :items="list_part"
            item-value="value"
            item-text="text"
            chips
            multiple
            ref="part_field"
          ></v-select>
          <v-textarea
            box
            label="Digite ou selecione uma fala para ser transformada em áudio"
            rows="2"
            auto-grow
            v-model="input_tts"
            counter="280"
            id="testando"
          ></v-textarea>
        </v-flex>
        <v-flex lg6 md6 xs12>
          <v-card flat>
            <v-card-text>
              <v-timeline dense>
                <v-slide-x-reverse-transition group hide-on-leave>
                  <v-timeline-item
                    v-for="item in dicas"
                    :key="item.id"
                    :color="item.color"
                    small
                    fill-dot
                  >
                    <v-layout justify-space-between>
                      <v-flex>
                        {{item.text}}
                        <v-btn flat small color="primary" @click="selecionarDica(item.text)">Selecionar</v-btn>
                      </v-flex>
                    </v-layout>
                  </v-timeline-item>
                </v-slide-x-reverse-transition>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-btn color="success" @click="request_tts()">Transformar</v-btn>
    </v-card-actions>
  </v-card>
</v-container>
   `,
  data() {
    return {
      list_toy: [],
      list_part: [
        { text: 'Braço direito', value: 'braco_direito' },
        { text: 'Braço esquerdo', value: 'braco_esquerdo' },
        { text: 'Perna direita', value: 'perna_direita' },
        { text: 'Perna esquerda', value: 'perna_esquerda' }
      ],
      select_toy: null,
      select_part: ['braco_direito', 'braco_esquerdo', 'perna_direita', 'perna_esquerda'],
      input_tts: null,
      responseData: null,
      api_key: null,
      api_url: null,
      interval: null,
      dicas_colors:['pink', 'teal lighten-3', 'cyan', 'amber', 'orange', 'purple lighten-1', 'brown lighten-2'],
      dicas_textos: [],
      dicas: [
        {
          id: 1,
          color: 'info',
          text: 'Olá tudo bem?'
        }
      ],
      nonce: 2
    }
  },
  mounted() {
    this.get_list_toy(),
    this.get_user_config(),
    this.get_list_dicas()
  },
  methods: {
	  addEvent () {
      this.dicas.unshift({
        id: this.nonce++,
        color: this.dicas_colors[Math.floor(Math.random() * this.dicas_colors.length)],
        text: this.dicas_textos[Math.floor(Math.random() * this.dicas_textos.length)]
	   })

      if (this.nonce > 5) {
        this.dicas.pop()
      }
    },
    get_list_dicas(){
      axios
      .get("/current_user/dicas/get")
      .then(
        response => (
          ((this.responseData = response.data),
            this.responseData.forEach(item => {
              this.dicas_textos.push(item.description);
            }
          ))
        )
      )
      .catch(error => {
        console.log(error)
        home.$refs.notification.makeNotification('error', 'Houve um erro ao buscar a listagem de dicas')
      });
      this.start_dicas()
    },
    start_dicas() {
      this.interval = setInterval(this.addEvent, 5000)
    },
    stop_dicas() {
      clearInterval(this.interval)
      this.interval = null
    },
    selecionarDica(texto){
      this.input_tts = texto
    },
    get_list_toy() {
      home.$refs.loading.start()
      axios
        .get("/current_user/toys/get")
        .then(
          response => (
            ((this.responseData = response.data),
              this.responseData.forEach(item => {
                this.list_toy.push(
                  { text: item.description, value: item.id }
                );
              })),
              this.select_toy = this.list_toy[0]
          ),
        )
        .catch(error => {
          console.log(error)
          home.$refs.notification.makeNotification('error', 'Houve um erro ao buscar a lista de brinquedos')
        });
        home.$refs.loading.stop()
    },
    get_user_config() {
      home.$refs.loading.start()
      axios
        .get("/current_user/config")
        .then(
          response => (
            this.api_key = response.data.api_key,
            this.api_url = response.data.api_url
          )
        )
        .catch(error => {
          console.log(error)
          home.$refs.notification.makeNotification('error', 'Houve um erro ao buscar as configurações do usuário')
        });
        home.$refs.loading.stop()
    },
    request_tts() {

      if (this.select_toy == null) {
        home.$refs.notification.makeNotification('warning', 'É necessário selecionar algum brinquedo!')
        this.$refs.toy_field.focus()
        return
      }

      if (this.api_key == null || this.api_url == null) {
        home.$refs.notification.makeNotification('warning', 'É necessário configurar o Token e Url nas configurações para prosseguir!')
        return
      }

      if (this.select_part.length <= 0) {
        home.$refs.notification.makeNotification('warning', 'É necessário selecionar algum membro do brinquedo!')
        return
      }
      if (this.input_tts == null) {
        home.$refs.notification.makeNotification('warning', 'É necessário escrever algum texto!')
        return
      }

      home.$refs.loading.start()
      axios
        .post(
          "/text_to_speech/post",
          {
            input_tts: this.input_tts,
            list_part: this.select_part,
            toy: this.select_toy.value
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
        .then(function (response) {
          home.$refs.loading.stop()
          if (response.data.status == "200"){
            home.$refs.notification.makeNotification('success', 'Áudio gerado com sucesso!')
          }else if (response.data.status == "100"){
            home.$refs.notification.makeNotification('error', 'Palavra ofensiva encontrada: ' + response.data.word)
          }else{
            home.$refs.notification.makeNotification('error', 'Houve um erro não mapeado :(')
          }
        })
        .catch(error => {
          home.$refs.loading.stop()
          home.$refs.notification.makeNotification('error', 'Erro ao transformar o texto :(')
          console.log(error)
        });
    }
  }
} 
