import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/styles/variables.css'
import './assets/styles/themes.css'
import './assets/styles/reset.css'
import './assets/styles/layout.css'
import './assets/styles/editor.css'
import './assets/styles/preview.css'
import './assets/styles/toolbar.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
