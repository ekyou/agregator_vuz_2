import axios from 'axios'
axios.defaults.baseURL = "http://localhost:3005"

import { createApp } from 'vue'
import App from './App.vue'
import router from "./router.js"

createApp(App).use(router).mount('#app')
