const TTS = {
  template: `
  <v-container fluid grid-list-md>
  <v-layout>
    <v-flex>
      <v-stepper v-model="view">
        <v-stepper-header>
          <v-stepper-step :complete="view > 1" step="1">Brinquedo</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2">Transformação</v-stepper-step>
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
                  item-text="text"
                  label="Selecione o brinquedo"
                  ref="toy_field"
                ></v-combobox>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="to_view_transform()" style="margin: 0px 0px;">Próximo</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>
          <!--TRANSFORMAÇÃO -->
          <v-stepper-content step="2">
            <v-card flat>
              <v-card-text>
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
                <v-divider></v-divider>
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
      current: 0
    }
  },
  mounted() {
    this.get_list_toy()
    this.get_user_config()
  },
  methods: {
    get_list_toy() {
      axios
        .get("http://iotoy.herokuapp.com/current_user/toys/get")
        .then(
          response => (
            ((this.responseData = response.data),
              this.responseData.forEach(item => {
                this.list_toy.push(
                  { text: item.description, value: item.id }
                );
              }))
          ),
        )
        .catch(error => {
          console.log(error)
          home.$refs.notification.makeNotification('error', 'Houve um erro ao buscar a lista de brinquedos')
        });
    },
    to_view_transform() {
      if (this.select_toy == null) {
        home.$refs.notification.makeNotification('warning', 'É necessário selecionar algum brinquedo!')
        this.$refs.toy_field.focus()
      } else {
        this.view = 2
      }
    },
    get_user_config() {
      axios
        .get("http://iotoy.herokuapp.com/current_user/config")
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
    },
    request_tts() {
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
          "http://iotoy.herokuapp.com/text_to_speech/post",
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
