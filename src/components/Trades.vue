<script>
import { fetchFromTornViaProxy } from '@/utils/tornProxy.js';

export default {
    name: 'Trades',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            log: null,
            trades: []
        }
    },
    methods: {

        async fetchLog(days) {

            let btnFetchLog = document.getElementById('btnFetchLog');
            let sectionMoney = document.getElementById('sectionMoney');

            try {
                btnFetchLog.setAttribute('aria-busy', 'true');
                sectionMoney.setAttribute('aria-busy', 'true');

                // const date = new Date();
                // const from = Math.round(date.setDate(date.getDate()-days) / 1000);
                // const to = Math.round(from+(3600*24));

                // log=4442 => trade money add
                // log=4482 => trade items add other user
                const url = `https://api.torn.com/user/?selections=log&cat=94&log=4442,4482&key=${this.user.apiKey}&comment=TornPortal`;
                const responsedata = await fetchFromTornViaProxy(url);
                
                btnFetchLog.setAttribute('aria-busy', 'false');
                sectionMoney.setAttribute('aria-busy', 'false');

                if (responsedata.hasOwnProperty('log')) {
                    return responsedata.log;
                } else {
                    throw("No trade logs found.");
                }

            } catch (e) {

                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                btnFetchLog.setAttribute('aria-busy', 'false');
                sectionMoney.setAttribute('aria-busy', 'false');
            }
            return null;
        },

        async getMarketValueForItem(id) {

            try {

                if (localStorage.getItem(`mv_${id}`)) {
                    const cachedmv = localStorage.getItem(`mv_${id}`);
                    console.log(`Using cached marketvalue: ${cachedmv}`);
                    //if (cachedmv > 0) {
                    return cachedmv;
                    //}
                }

                console.log(`Fetching market value for item id ${id}...`);
                const url = `https://api.torn.com/v2/market/${id}/itemmarket?offset=0`;
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `ApiKey ${this.user.apiKey}`
                }
                const responsedata = await fetchFromTornViaProxy(url, headers);
                const averagePrice = parseInt(responsedata.itemmarket.item.average_price);
                localStorage.setItem(`mv_${id}`, averagePrice);
                return averagePrice;

            } catch(error) {
                console.error("Error: ", error);
            }
            return 0;
        },

        async summarizeLog(log) {

            console.log("****** summarizeLog begin");
            let outgoing = 0;
            let incoming = 0;
            let trades = [];
            let itemsReceived = 0;

            const parseTrade = async (trade) => {

                /* Get trade id */
                if (trade?.data?.trade_id) {
                    const html = trade.data.trade_id.toString();
                    const matchTradeId = html.match(/ID=(\d+)/);

                    if (matchTradeId && matchTradeId[1]) {
                        const tradeId = parseInt(matchTradeId[1], 10);
                        if (!trades.includes(tradeId)) {
                            trades.push(tradeId);
                        }
                    }
                }

                /* Check what type of log event */
                if (trade.log === 4442) {
                    // Trade money added by yourself
                    outgoing += parseInt(trade.data.total);
                } else if (trade.log === 4482) {
                    // Trade items added by other user
                    for (const itm of trade.data.items) {
                        itemsReceived += parseInt(itm.qty);
                        // Get market value for item
                        const mv = await this.getMarketValueForItem(itm.id);
                        console.log(`mv: ${mv}`);
                        incoming += parseInt(itm.qty * mv);
                    }
                }
            }

            for (const [key, trade] of Object.entries(log)) {
                console.log(`Parsing trade ${key}...`);
                await parseTrade(trade);
            }

            return {
                trades: trades,
                incoming: incoming,
                outgoing: outgoing,
                itemsReceived: itemsReceived
            };
        },

        refreshData(days) {
            console.log("Refreshing data...");
            this.fetchLog(days).then((log) => {
                if (log != null) {
                    console.log("Fetched log from Torn API! Saving to localStorage");
                    localStorage.setItem('trades', JSON.stringify(log));
                    /**
                     * all trades with id log=4482 means items added by someone else
                     * all entries with id log=4442 means money added by you
                     */
                    this.log = this.summarizeLog(log);
                    console.log(this.log);
                } else {
                    console.warn("Log is empty... API troubles?");
                }
            })
        }
    },
    async mounted() {

        // Use cached data if it exists to ensure quick loading
        if (localStorage.getItem('trades') != null) {
            console.log("Found cached log!");
            let log = JSON.parse(localStorage.getItem('trades'));

            let btnFetchLog = document.getElementById('btnFetchLog');
            let sectionMoney = document.getElementById('sectionMoney');

            btnFetchLog.setAttribute('aria-busy', 'true');
            sectionMoney.setAttribute('aria-busy', 'true');

            console.log('Mounted before summarize');
            this.log = await this.summarizeLog(log);
            console.log('Mounted after summarize');
            console.log(this.log);

            btnFetchLog.setAttribute('aria-busy', 'false');
            sectionMoney.setAttribute('aria-busy', 'false');
            
        } else {
            this.refreshData(1);
        }
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-chart-simple"></i> Trades</h1>


    <article id="sectionMoney" v-if="log != null">
        <p>Stats from your last <b>{{ $filters.toNumberFormat(log.trades.length) }}</b> trades.</p>
        <figure>
            <table>
                <!-- <tr>
                    <td>Unique trades</td>
                    <td>{{ $filters.toNumberFormat(log.trades.length) }}</td>
                </tr> -->
                <tr>
                    <td>Items received</td>
                    <td>{{ $filters.toNumberFormat(log.itemsReceived) }}</td>
                </tr>
                <tr>
                    <td>Estimated worth</td>
                    <td>{{ $filters.toMoney(log.incoming) }}</td>
                </tr>
                <tr>
                    <td>Money paid</td>
                    <td>{{ $filters.toMoney(log.outgoing) }}</td>
                </tr>
                <tr>
                    <td>Profit</td>
                    <td>{{ $filters.toMoney(log.incoming-log.outgoing) }}</td>
                </tr>

                <!-- <tr v-for="entry in log">
                    <td>{{ entry.incoming }}</td>
                    <td>{{ entry.category }}</td>
                    <td>{{ entry.title }}</td>
                    <td :class="entry.money === 'incoming' ? 'totals success' : 'totals danger'">{{ entry.value }}</td>
                </tr> -->

            </table>
        </figure>
    </article>

    <article id="sectionMoney" v-else>
        Sorry, unable to fetch logs...
    </article>

    <div class="grid">
        <a href="#" id="btnFetchLog" role="button" @click="refreshData(1)">Refresh</a>
        <!-- <a href="#" id="btnFetchLog" role="button" @click="refreshData(7)">Last 7 days</a>
        <a href="#" id="btnFetchLog" role="button" @click="refreshData(30)">Last 30 days</a> -->
    </div>
</template>

<style scoped>
.totals {
    text-align: right;
}
hr {
    border-top:1px solid #333;
}
a[role=button] {
    margin-bottom:10px;
}
</style>