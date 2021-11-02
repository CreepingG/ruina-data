import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { Search } from '@element-plus/icons'

const app = createApp(App);
app.use(ElementPlus);
app.component('search', Search);
app.mount('#app');
