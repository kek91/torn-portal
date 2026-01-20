<script>
import { fetchFromTornViaProxy } from '@/utils/tornProxy.js';
import { sendNotification } from '@/utils/notificationUtils.js';

export default {
    name: 'MarketWatcher',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            interval: 30,
            itemIds: '',
            tags: [],
            lastPolled: (Date.now()/1000),
            watcherIntervalId: null,
            timerIntervalId: null,
            items: {},
            isWatching: false,
        }
    },
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
            this.watcherIntervalId = setInterval(this.pollMarketWatcher, interval, this.tags);
            this.pollMarketWatcher(this.tags); // Initial immediate poll

            this.lastPolled = (Date.now()/1000);
            this.isWatching = true;
            this.updateLastPolledCounter();
        },
        pollMarketWatcher(items) {
            items.forEach(item => {

                const url = `https://api.torn.com/v2/market/${item}/itemmarket?limit=5&offset=0&comment=TornHelper`;
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `ApiKey ${this.user.apiKey}`
                }
                fetchFromTornViaProxy(url, headers).then( (responsedata) => {
                    console.log(responsedata);
                    if (responsedata.itemmarket) {
                        const itemData = responsedata.itemmarket;
                        this.items[itemData.item.id] = {
                            name: itemData.item.name,
                            type: itemData.item.type,
                            average_price: itemData.item.average_price,
                            listings: itemData.listings
                        };
                    }
                    this.lastPolled = Date.now()/1000;
                });
            });
        },
        stopMarketWatcher(e) {
            try {
            if(e) { e.preventDefault(); }
            console.log("Stopping market watcher");
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = null;
            this.isWatching = false;
            clearInterval(this.watcherIntervalId);
            this.watcherIntervalId = null;
            } catch(err) {
                console.error("Error stopping market watcher:", err);
            }
        },
        updateLastPolledCounter() {
            this.timerIntervalId = setInterval(() => {
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
    },
    unmounted() {
        // Clean up intervals when component is unmounted
        this.stopMarketWatcher();
    }
}
</script>

<template>

    <h1><i class="fa fa-shopping-cart"></i> Market Watcher</h1>

    <article id="sectionMarketWatcherActive" v-if="isWatching">
        <h2 class="success centered">Watcher is active!</h2>
        <h3 class="centered">checked <span id="pollCounter">{{ Math.round((Date.now()/1000) - lastPolled) }}</span>s ago</h3><br>
        
        <div id="itemsGrid">
            <div v-for="(item, itemId) in items" :key="itemId" class="itemCard">
                <h4>{{ item.name }} <small style="color: #999;">({{ item.type }} - Avg: ${{ item.average_price.toLocaleString() }})</small></h4>
                <table>
                    <thead>
                        <tr><th></th><th>Price</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="(listing, index) in item.listings" :key="index" :class="{
                            'great-deal': listing.price < item.average_price * 0.5,
                            'good-deal': listing.price >= item.average_price * 0.5 && listing.price < item.average_price,
                            'warning': listing.price >= item.average_price * 1.1 && listing.price <= item.average_price * 1.2,
                            'expensive': listing.price > item.average_price * 1.2
                        }">
                            <td class="icon-cell">
                                <i v-if="listing.price < item.average_price * 0.5" class="fa-solid fa-star" style="color: #1b5e20;"></i>
                                <i v-else-if="listing.price < item.average_price" class="fa-solid fa-circle-check" style="color: #2e7d32;"></i>
                                <i v-else-if="listing.price > item.average_price * 1.2" class="fa-solid fa-triangle-exclamation" style="color: #ff6b6b;"></i>
                                <i v-else-if="listing.price >= item.average_price * 1.1" class="fa-solid fa-exclamation" style="color: #ffa500;"></i>
                            </td>
                            <td>${{ listing.price.toLocaleString() }}</td>
                            <td>{{ listing.amount }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>


        <br><br>

        <form @submit="stopMarketWatcher">
            <button type="submit" id="btnSubmitStopMarketWatcher" class="secondary">Stop watching</button>
        </form>

        <br>


    </article>

    <article id="sectionMarketWatcher" v-if="!isWatching">

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

            <button type="submit" id="btnSubmitStartMarketWatcher">Start watching</button>
        </form>

        <span class="centered">
            <p :class="Math.round((60/interval)*tags.length) > 75 ? 'danger' : Math.round((60/interval)*tags.length) > 45 ? 'warning' : 'success'">
                The Market Watcher will trigger <b>{{ Math.round((60/interval)*tags.length) }}</b> API requests every minute<br>
                <small>{{ tags.length }} requests every {{ interval }} second</small>
            </p>
        </span>

    </article>

    <p class="danger center"><small>No websockets were harmed in the making of this tool</small></p>


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
tr.great-deal {
    background-color: rgba(27, 94, 32, 0.3);
    font-weight: bold;
}
tr.great-deal td {
    color: #1b5e20;
}
tr.good-deal {
    background-color: rgba(76, 175, 80, 0.2);
    font-weight: bold;
}
tr.good-deal td {
    color: #2e7d32;
}
tr.warning {
    background-color: rgba(255, 193, 7, 0.15);
}
tr.warning td {
    color: #f57f17;
}
tr.expensive {
    background-color: rgba(255, 107, 107, 0.15);
}
tr.expensive td {
    color: #ff6b6b;
}
.icon-cell {
    text-align: center;
    width: 2rem;
}
#itemsGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}
.itemCard {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}
.itemCard h4 {
    margin-top: 0;
}
@media (max-width: 1024px) {
    #itemsGrid {
        grid-template-columns: 1fr;
    }
}
</style>
