<script>
import { fetchFromTornViaProxy } from '@/utils/tornProxy.js';
import { sendNotification } from '@/utils/notificationUtils.js';

export default {
    name: 'MarketWatcher',
    props: {
        user: {
            type: Object,
            required: true
        },
        marketWatcher: {
            type: Number,
            required: false
        },
        marketWatcherData: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            interval: 30,
            itemIds: '',
            tags: [],
            lastPolled: (Date.now()/1000),
            intervalId: null,
            intervalId2: null,
        }
    },
    emits: [
        "setMarketWatcher",
        "setMarketWatcherData",
        "clearMarketWatcher",
        "clearMarketWatcherData",
        "updateMarketWatcher"
    ],
    methods: {
        cacheInterval(e) {
            localStorage.setItem('marketWatcherInterval', e.target.value);
        },
        parseItemIds() {
            // Parse comma-separated input and clean up whitespace
            this.tags = this.itemIds
                .split(',')
                .map(id => id.trim())
                .filter(id => id && /^[0-9]+$/.test(id));
            localStorage.setItem('marketWatcherTags', this.tags.join(','));
        },
        async startMarketWatcher(e) {
            e.preventDefault();

            console.log("Setting up market watcher!");
            console.log(`Item IDs: ${this.tags}`);
            console.log(`Poll interval: ${this.interval}`);


            let interval = Math.max(this.interval, 5) * 1000;
            let intervalId = setInterval(this.pollMarketWatcher, interval, this.tags);
            let marketWatcherData = {
                tags: this.tags,
                interval: interval,
                intervalId: intervalId,
            }

            this.lastPolled = (Date.now()/1000);

            this.$emit('setMarketWatcher', intervalId);
            this.$emit('setMarketWatcherData', marketWatcherData);

            this.updateLastPolledCounter();
        },
        pollMarketWatcher(items) {
            items.forEach(item => {

                const url = `https://api.torn.com/v2/market/${item}/itemmarket?limit=10&offset=0&comment=TornHelper`;
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `ApiKey ${this.user.apiKey}`
                }
                fetchFromTornViaProxy(url, headers).then( (responsedata) => {
                    console.log(responsedata);
                    this.lastPolled = Date.now()/1000;
                    this.$emit('updateMarketWatcher', items);
                });
            });
        },
        stopMarketWatcher(e) {
            e.preventDefault();
            console.log("Stopping market watcher");
            clearInterval(this.marketWatcher);
            this.$emit('clearMarketWatcher');
        },
        updateLastPolledCounter() {
            setInterval(() => {
                let pollCounter = document.getElementById('pollCounter');
                if(pollCounter) {
                    pollCounter.innerHTML = Math.round((Date.now() / 1000) - this.lastPolled);
                }
            },1000)
        }
    },
    mounted() {

        // Pre-populate torn user ids with cached data
        if (localStorage.getItem('marketWatcherTags') != null) {
            this.itemIds = localStorage.getItem('marketWatcherTags');
            this.parseItemIds();
        }

        // Pre-populate interval slider if it's been adjusted before
        if (localStorage.getItem('marketWatcherInterval') != null) {
            this.interval = localStorage.getItem('marketWatcherInterval');
        }
    }
}
</script>

<template>

    <h1><i class="fa fa-shopping-cart"></i> Market Watcher</h1>

    <article id="sectionMarketWatcherActive" v-if="marketWatcher">
        <h2 class="success centered">Surveillance is active!</h2>
        <h3 class="centered">checked <span id="pollCounter">{{ Math.round((Date.now()/1000) - lastPolled) }}</span>s ago</h3><br>
        <table>
            <thead>
                <tr><th>User</th><th>Status</th><th>Market token refills</th><th>Refilled now?</th><th>Attack</th></tr>
            </thead>
            <tbody>
                <tr v-for="user in marketWatcherData.users" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td :class="user.status == 'Okay' ? 'success' : 'danger'">{{ user.status }}</td>
                    <td>{{ user.refills }}</td>
                    <td>{{ user.refilled ? 'Yes, attack!' : 'Nope, keep waiting...' }}</td>
                    <td>
                        <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + user.id" target="blank">
                            <i class="fa-solid fa-gun fa-2xl" :class="user.refilled ? 'danger fa-beat' : ''"></i>
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>


        <br><br>

        <form @submit="stopMarketWatcher">
            <button type="submit" id="btnSubmitStopMarketWatcher" class="secondary">Stop surveillance</button>
        </form>

        <br>
        <div style="font-size:0.8rem; color:#999;">Debugging:<br>
            tags: {{ tags.toString().split(',') }}<br>
            marketWatcher: {{ marketWatcher }}<br>
            interval: {{ interval }}<br>
        </div>


    </article>

    <article id="sectionMarketWatcher" v-else>

        <p class="danger">No websockets were harmed in the making of this marketwatcher!</p>

        <p><small>
            The Market Watcher can be used to snipe good deals on the market.<br>
            Just set an item id, timer interval, and wait for a sweet deal to pop up!<br><br>

            Keep in mind that this tool may potentially send lots of requests to Torn API, so your API key may be rate-limited.<br>
            Use the indicator in the bottom and try to stay way below 50 requests pr minute to be on the safe side.<br><br>
            - Enter the user ID of those you wish to track<br>
            - Adjust the slider to choose a polling interval in seconds
        </small></p>

        <form @submit="startMarketWatcher">

            <input 
                type="text" 
                v-model="itemIds" 
                @input="parseItemIds"
                placeholder="Enter item IDs separated by commas (e.g., 2314142, 2935324, 12313)"
            ><br>
            <small>Items entered: {{ tags.length > 0 ? tags.join(', ') : 'None' }}</small><br>

            <input type="range" id="inputMarketWatcherInterval" min="5" max="60" step="5" v-model="interval" @change="cacheInterval"><br>

            <button type="submit" id="btnSubmitStartMarketWatcher">Start monitoring</button>
        </form>

        <span class="centered">
            <p :class="Math.round((60/interval)*tags.length) > 75 ? 'danger' : Math.round((60/interval)*tags.length) > 45 ? 'warning' : 'success'">
                The Market Watcher will trigger <b>{{ Math.round((60/interval)*tags.length) }}</b> API requests every minute<br>
                <small>{{ tags.length }} requests every {{ interval }} second</small>
            </p>
        </span>

    </article>


</template>

<style scoped>
h2 {
    margin:0;
    padding:0;
}
svg.danger {
    color:darkorange;
}
svg.danger:hover {
    color:orangered;
}
</style>
