Vue.component('plan-card', {
    template: `
    <div id="plan">
        <v-card class="elevation-12">
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
    </div>
    `,
    data() {
        return {
            
        }
    }
})