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
            apiRequestsCount: 0
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
                    // console.log(responsedata);
                    this.apiRequestsCount += 1;
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
        },
        getPricePercentage(price, averagePrice) {
            // Calculate percentage difference from average price
            // Returns negative for cheaper, positive for more expensive
            return Math.round(((price - averagePrice) / averagePrice) * 100);
        },
        getPriceColor(price, averagePrice) {
            // Calculate dynamic RGB color based on price percentage
            // Green (-50% cheaper) -> Yellow (average) -> Red (+50% expensive)
            const percentage = this.getPricePercentage(price, averagePrice);
            
            // Clamp percentage between -50 and +50
            const clamped = Math.max(-50, Math.min(50, percentage));
            
            // Map clamped value to 0-1 ratio
            const ratio = (clamped + 50) / 100;
            
            // Calculate RGB components
            const r = Math.round(255 * ratio);
            const g = Math.round(255 * (1 - ratio));
            const b = 0;
            
            return `rgb(${r}, ${g}, ${b})`;
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
                        <tr><th>Price</th><th>Diff</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="(listing, index) in item.listings" :key="index">
                            <!-- <td class="icon-cell">
                                <i v-if="listing.price < item.average_price * 0.5" class="fa-solid fa-star"></i>
                                <i v-else-if="listing.price < item.average_price" class="fa-solid fa-circle-check"></i>
                                <i v-else-if="listing.price > item.average_price * 1.2" class="fa-solid fa-triangle-exclamation"></i>
                                <i v-else-if="listing.price >= item.average_price * 1.1" class="fa-solid fa-exclamation"></i>
                            </td> -->
                            <td :style="{ color: getPriceColor(listing.price, item.average_price), fontWeight: Math.abs(this.getPricePercentage(listing.price, item.average_price)) > 20 ? 'bold' : 'normal' }">${{ listing.price.toLocaleString() }}</td>
                            <td :style="{ color: getPriceColor(listing.price, item.average_price), fontWeight: Math.abs(this.getPricePercentage(listing.price, item.average_price)) > 20 ? 'bold' : 'normal' }">{{ this.getPricePercentage(listing.price, item.average_price) }}%</td>
                            <td>{{ listing.amount }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>


        <br><br>

        <p class="centered"><small>
            {{ Object.keys(items).length }} items being watched.<br>
            {{ apiRequestsCount }} API requests made since starting the watcher.
        </small></p>

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

            <!-- 
                Parachute, Xan, FHX, Tyrosine
                106, 206, 367, 814 
             -->
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
