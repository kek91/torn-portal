import './assets/pico.min.css'

import { createApp,h } from 'vue'
import App from './App.vue'
import Notifications from '@kyvg/vue3-notification'

const app = createApp(App);

app.config.globalProperties.$filters = {
    toMoney(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            // These options are needed to round to whole numbers if that's what you want.
            minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
            maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
        }).format(value);
    },
    toNumberFormat(value) {
        return new Intl.NumberFormat().format(value);
    },
    toShortNumber(number) {
        if (number >= 1000000000) {
            return `${(number / 1000000000).toFixed(1)}B`;
        } else if (number >= 1000000) {
            return `${(number / 1000000).toFixed(1)}M`;
        } else if (number >= 1000) {
            return `${(number / 1000).toFixed(1)}K`;
        } else {
            return `< 1K`;
        }
    },
    shortenBs(bs) {
        if (bs >= 1000000000) {
            return `${(bs / 1000000000).toFixed(1)}B`;
        } else if (bs >= 1000000) {
            return `${(bs / 1000000).toFixed(0)}M`;
        } else if (bs >= 1000) {
            return `${(bs / 1000).toFixed(0)}K`;
        } else {
            return `< 1K`;
        }
    }
};

app.use(Notifications);

app.mount('#app');