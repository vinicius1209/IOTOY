const routes = [ 
   { path: '/transformar', component: TTS },
   { path: '/biblioteca', component: Biblioteca },
   { path: '/brinquedos', component: Toys },
   { path: '/dicas', component: Dicas },
   { path: '/config', component: Config } 
] 

const router = new VueRouter({
   routes, 
   mode:'history' 
})