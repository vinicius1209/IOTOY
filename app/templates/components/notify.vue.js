Vue.component('notify', {
    template: `
    <v-card>
        <v-snackbar v-model="snackbar.active" :color="snackbar.color" :timeout="snackbar.timeout" multi-line>
            {{ snackbar.text }}
        </v-snackbar>
    </v-card>
    `,
    data() {
        return {
            snackbar: {
                active: false,
                timeout: 2000,
                color: 'success',
                text: '-'
            }
        }
    },
    methods: {
        makeNotification(type, msg) {
            this.snackbar.color = type;
            this.snackbar.text = msg;
            this.snackbar.active = true;
        }
    }
})