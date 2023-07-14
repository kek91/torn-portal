import './assets/pico.min.css'

import { createApp,h } from 'vue'
import App from './App.vue'
import Notifications from '@kyvg/vue3-notification'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faHouse, faMoneyBill, faUserSecret, faMagicWandSparkles, faToolbox, faCircleInfo, faArrowRightFromBracket, faArrowsRotate, faGun } from '@fortawesome/free-solid-svg-icons'
// import {  } from '@fortawesome/free-regular-svg-icons'
import { faWatchmanMonitoring, faGithub } from '@fortawesome/free-brands-svg-icons'

/* add icons to the library */
library.add(faHouse, faMoneyBill, faUserSecret, faMagicWandSparkles, faToolbox, faCircleInfo, faArrowRightFromBracket, faArrowsRotate, faGun);
library.add(faWatchmanMonitoring, faGithub);

const app = createApp(App);
app.use(Notifications);
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app');
