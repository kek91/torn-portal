<script>
import { fetchFromTornViaProxy } from '@/utils/tornProxy.js';
import { sendNotification, enableNotifications } from '@/utils/notificationUtils.js';

export default {
    name: 'MarketWatcher',
    props: {
        user: {
            type: Object,
            required: true
        },
        profile: {
            type: Object,
            required: true
        },
        itemDb: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            interval: 30,
            itemIds: '',
            tags: [],
            itemTags: [], // Array of objects with id and name
            lastPolled: (Date.now()/1000),
            watcherIntervalId: null,
            timerIntervalId: null,
            items: {},
            isWatching: false,
            apiRequestsCount: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            selectedSuggestionIndex: -1
        }
    },
    methods: {
        cacheInterval(e) {
            localStorage.setItem('marketWatcherInterval', e.target.value);
        },
        parseItemIds() {
            // Parse comma-separated input and clean up whitespace
            const inputs = this.itemIds
                .split(',')
                .map(input => input.trim())
                .filter(input => input);
            
            // Convert item names to IDs and filter valid entries
            this.tags = inputs
                .map(input => {
                    // Check if input is already a numeric ID
                    if (/^[0-9]+$/.test(input)) {
                        return input;
                    }
                    // Try to find item by name (case-insensitive)
                    const itemEntry = Object.entries(this.itemDb).find(
                        ([id, item]) => item.name.toLowerCase() === input.toLowerCase()
                    );
                    return itemEntry ? itemEntry[0] : null;
                })
                .filter(id => id !== null);
            
            // Lookup item names from itemDb
            this.itemTags = this.tags.map(id => ({
                id: id,
                name: this.itemDb[id]?.name || 'Unknown'
            }));
            
            localStorage.setItem('marketWatcherTags', this.tags.join(','));
            this.updateSuggestions();
        },
        getCurrentInputWord() {
            // Extract the word currently being typed (after the last comma)
            const lastCommaIndex = this.itemIds.lastIndexOf(',');
            if (lastCommaIndex === -1) {
                return this.itemIds.trim();
            }
            return this.itemIds.substring(lastCommaIndex + 1).trim();
        },
        updateSuggestions() {
            const currentWord = this.getCurrentInputWord();
            
            if (!currentWord || currentWord.length < 1) {
                this.showSuggestions = false;
                this.filteredSuggestions = [];
                return;
            }
            
            const lowerWord = currentWord.toLowerCase();
            
            // Filter items from itemDb that match current word
            this.filteredSuggestions = Object.entries(this.itemDb)
                .filter(([id, item]) => {
                    // Don't suggest items already selected
                    const alreadySelected = this.tags.includes(id);
                    // Match name or ID
                    const nameMatch = item.name.toLowerCase().includes(lowerWord);
                    const idMatch = id.includes(currentWord);
                    return !alreadySelected && (nameMatch || idMatch);
                })
                .map(([id, item]) => ({ id, name: item.name }))
                .slice(0, 10); // Limit to 10 suggestions
            
            this.showSuggestions = this.filteredSuggestions.length > 0;
            this.selectedSuggestionIndex = -1;
        },
        selectSuggestion(suggestion) {
            console.log("selected suggestion:", suggestion);
            // Replace the current word with the selected item
            const lastCommaIndex = this.itemIds.lastIndexOf(',');
            const beforeCurrentWord = lastCommaIndex === -1 ? '' : this.itemIds.substring(0, lastCommaIndex + 1);
            
            this.itemIds = beforeCurrentWord + (beforeCurrentWord ? ' ' : '') + suggestion.name + ', ';
            this.parseItemIds();
            this.showSuggestions = false;
            
            // Focus back on input
            this.$nextTick(() => {
                this.$refs.itemInput?.focus();
            });
        },
        handleKeyDown(e) {
            if (!this.showSuggestions) return;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedSuggestionIndex = Math.min(
                        this.selectedSuggestionIndex + 1,
                        this.filteredSuggestions.length - 1
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedSuggestionIndex >= 0) {
                        this.selectSuggestion(this.filteredSuggestions[this.selectedSuggestionIndex]);
                    }
                    break;
                case 'Escape':
                    this.showSuggestions = false;
                    break;
            }
        },
        async startMarketWatcher(e) {
            e.preventDefault();

            console.log("Setting up market watcher!");
            console.log(`Item IDs: ${this.tags}`);
            console.log(`Poll interval: ${this.interval}`);

            if (this.profile.faction.faction_tag !== "EMU") {
                alert("Sorry, the market watcher is only available for Viking Emus so far.");
                return;
            }

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
            console.log("Autofilling item ids from cache...");
            this.itemIds = localStorage.getItem('marketWatcherTags');
            this.parseItemIds();
        }

        // Pre-populate interval slider if it's been adjusted before
        if (localStorage.getItem('marketWatcherInterval') != null) {
            this.interval = localStorage.getItem('marketWatcherInterval');
        }

        enableNotifications();
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
                <b>
                    {{ item.name }}<br>
                    <small style="color: #999;">{{ item.type }} - Avg: ${{ item.average_price.toLocaleString() }}</small>
                </b>
                <table>
                    <thead>
                        <tr><th>Price</th><th>Diff</th><th>Qty</th><th></th></tr>
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
                            <td>
                                <a :href="'https://www.torn.com/page.php?sid=ItemMarket#/market/view=search&itemID=' + itemId"
                                    target="blank" class="secondary">
                                    <i class="fa fa-shopping-cart fa-xl"></i>
                                </a>
                            </td>
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
            <div style="position: relative;">
                <input 
                    ref="itemInput"
                    type="text" 
                    v-model="itemIds" 
                    @input="parseItemIds"
                    @keydown="handleKeyDown"
                    @blur="showSuggestions = false"
                    @click="showSuggestions = true"
                    @focus="showSuggestions = true"
                    placeholder="Enter item names or IDs separated by commas (e.g., xanax, Parachute, 367)"
                >
                <div v-if="showSuggestions" class="autocomplete-dropdown">
                    <div 
                        v-for="(suggestion, index) in filteredSuggestions" 
                        :key="suggestion.id"
                        class="autocomplete-item"
                        :class="{ 'selected': index === selectedSuggestionIndex }"
                        @mousedown="selectSuggestion(suggestion)"
                        @mouseenter="selectedSuggestionIndex = index"
                    >
                        {{ suggestion.name }} <small style="color: #999;">({{ suggestion.id }})</small>
                    </div>
                </div>
            </div><br>
            <small v-if="itemTags.length > 0">Items: {{ itemTags.map(t => `${t.name} (${t.id})`).join(', ') }}</small>
            <small v-else>Items entered: None</small><br>

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
.autocomplete-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
@media (prefers-color-scheme: dark) {
    .autocomplete-dropdown {
        background: #2d2d2d;
        border: 1px solid #444;
        border-top: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
}
.autocomplete-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: inherit;
}
@media (prefers-color-scheme: dark) {
    .autocomplete-item {
        border-bottom: 1px solid #444;
        color: #e0e0e0;
    }
}
.autocomplete-item:hover,
.autocomplete-item.selected {
    background-color: #f0f0f0;
}
@media (prefers-color-scheme: dark) {
    .autocomplete-item:hover,
    .autocomplete-item.selected {
        background-color: #404040;
    }
}
.autocomplete-item:last-child {
    border-bottom: none;
}
#itemsGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}
.itemCard {
    padding: 2px;
    /* border: 1px solid #ddd;
    border-radius: 4px; */
}
.itemCard h4 {
    margin-top: 0;
}
@media (max-width: 1024px) {
    #itemsGrid {
        grid-template-columns: 1fr;
    }
}
@media (max-width: 390px) {
    article {
        padding:2px;
        overflow:hidden;
        font-size:0.9rem;
    }
}
</style>
