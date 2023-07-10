import './assets/pico.classless.min.css'

import { createApp,h } from 'vue'
import App from './App.vue'
import Notifications from '@kyvg/vue3-notification'

const app = createApp(App);
app.use(Notifications);
app.mount('#app');
