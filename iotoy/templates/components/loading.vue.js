Vue.component('loading-card', {
    template: `
        <v-dialog v-model="dialog" hide-overlay persistent width="300">
            <v-card color="primary" dark>
            <v-card-text>
                Carregando
                <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
            </v-card-text>
            </v-card>
        </v-dialog>
  `,
    data() {
        return {
            dialog: false
        }
    },
    methods: {
        start(){
            this.dialog = true;
        },
        stop(){
            this.dialog = false
        }
    }
})
