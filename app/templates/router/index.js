const routes = [ 
   { path: '/transformar', component: TTS },
   { path: '/biblioteca', component: Biblioteca },
   { path: '/brinquedos', component: Toys },
   { path: '/config', component: Config } 
] 

const router = new VueRouter({
   routes, 
   mode:'history' 
})