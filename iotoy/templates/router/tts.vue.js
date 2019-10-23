const TTS = {
  template: `
  <v-container fluid grid-list-md>
    <v-layout row wrap>
      <v-flex lg12 md12 xs12>
        <v-card flat>
          <v-card-text>
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
              label="Selecione quais partes do brinquedo você deseja"
              multiple
              ref="part_field"
            ></v-select>
            <v-textarea
              box
              label="Digite o texto para ser transformado em áudio"
              rows="2"
              auto-grow
              v-model="input_tts"
              counter="280"
              id="testando"
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" @click="request_tts()" style="margin: 0px 0px;">Transformar</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex lg12 md12 xs12>
      
      <v-card flat>
        <v-card-text>
          <v-timeline dense>
            <v-slide-x-reverse-transition group hide-on-leave>
              <v-timeline-item v-for="item in items" :key="item.id" :color="item.color" small fill-dot>
                <v-alert
                  :value="true"
                  :color="item.color"
                  :icon="item.icon"
                >Olá tudo bem?</v-alert>
              </v-timeline-item>
            </v-slide-x-reverse-transition>
          </v-timeline>
        </v-card-text>
    </v-card>

      </v-flex>
    </v-layout>
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
      COLORS: [
        'info',
        'warning',
        'error',
        'success'
      ],
      ICONS: {
        info: 'mdi-information',
        warning: 'mdi-alert',
        error: 'mdi-alert-circle',
        success: 'mdi-check-circle'
      }
    }
  },
  mounted() {
    this.get_list_toy(),
    this.get_user_config(),
    this.start()
  },
  methods: {
    get_list_toy() {
      home.$refs.loading.start()
      axios
        .get("https://iotoy.herokuapp.com/current_user/toys/get")
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
        .get("https://iotoy.herokuapp.com/current_user/config")
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
          "https://iotoy.herokuapp.com/text_to_speech/post",
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
    },

    addEvent(){
      let { color, icon } = this.genAlert()

      const previousColor = this.items[0].color

      while (previousColor === color) {
        color = this.genColor()
      }

      this.items.unshift({
        id: this.nonce++,
        color,
        icon
      })

      if (this.nonce > 6) {
        this.items.pop()
      }
    },
    genAlert(){
      const color = this.genColor()
      return {
        color,
        icon: this.genIcon(color)
      }
    },
    genColor() {
      return this.COLORS[Math.floor(Math.random() * 3)]
    },
    genIcon(color) {
      return this.ICONS[color]
    },
    start() {
      this.interval = setInterval(this.addEvent, 3000)
    },
    stop() {
      clearInterval(this.interval)
      this.interval = null
    }


  }
} 
