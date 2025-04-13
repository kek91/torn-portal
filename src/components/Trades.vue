<script>

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

                const date = new Date();
                const from = Math.round(date.setDate(date.getDate()-days) / 1000);
                const to = Math.round(from+(3600*24));

                let logs;

                for (let i = 0; i < days; i++) {
                    const response = await fetch(`https://api.torn.com/user/?selections=log&cat=94&from=${from}&to=${(to+(i*(3600*24)))}&comment=tornportal&key=${this.user.apiKey}`);
                    const data = await response.json();

                    if(!response.ok || data.hasOwnProperty('error')) {
                        if (data.hasOwnProperty('error')) {
                            throw `API Error: ${data.error.error}`;
                        }
                        throw `API Error: Unknown`;
                    }


                    logs = {...logs, ...data.log};
                }

                btnFetchLog.setAttribute('aria-busy', 'false');
                sectionMoney.setAttribute('aria-busy', 'false');
                return logs;

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
        filterLog(log) {

            // Create our number formatter.
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                // These options are needed to round to whole numbers if that's what you want.
                minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
                maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
            });

            const incomingMoneyTitles = [
                "sell",
                "crime success",
                "trade money incoming",
                "incoming"
            ];
            const outgoingMoneyTitles = [
                "buy",
                "outgoing"
            ];

            try {
                let entries = Object.keys(log);
                let totalIncoming = 0;
                let totalOutgoing = 0;
                let transactionsIn = 0;
                let transactionsOut = 0;
                let trades = [];

                entries.map((itm) => {

                    let tradeId = '';
                    if (log[itm].hasOwnProperty('data') && log[itm].data.hasOwnProperty('trade_id')) {
                        console.log('yeah');
                        try {
                            tradeId = parseInt(log[itm].data.trade_id.toString().split('ID=')[1].split('"')[0]);
                            if(typeof tradeId === "number" && tradeId > 0) {
                                trades[tradeId] = {};
                            }
                            //this.trades[tradeId] = {"bla":"blahblah"};
                        } catch (e) {
                            console.log(`Something went wrong parsing tradeIt: ${e}`);
                        }
                    }

                    //const tradeId = log[itm].data.trade_id.toString().split('ID=')[1].split('\\')[0];
                    //console.log(`tradeIt: ${tradeId}`);

                    log[itm].value = formatter.format(log[itm].data.money);

                    /*
                    let keep = false;
                    incomingMoneyTitles.forEach(validEntry => {
                        if (log[itm].title.toString().toLowerCase().includes(validEntry)) {
                            if (log[itm].data.hasOwnProperty('money')) {
                                totalIncoming += log[itm].data.money;
                                log[itm].value = formatter.format(log[itm].data.money);
                                keep = true;
                            } else if (log[itm].data.hasOwnProperty('worth')) {
                                totalIncoming += log[itm].data.worth;
                                log[itm].value = formatter.format(log[itm].data.worth);
                                keep = true;
                            } else if (log[itm].data.hasOwnProperty('cost_total')) {
                                totalIncoming += log[itm].data.cost_total;
                                log[itm].value = formatter.format(log[itm].data.cost_total);
                                keep = true;
                            } else if (log[itm].data.hasOwnProperty('money_gained')) {
                                totalIncoming += log[itm].data.money_gained;
                                log[itm].value = formatter.format(log[itm].data.money_gained);
                                keep = true;
                            }
                            if (keep) {
                                log[itm].money = "incoming";
                                transactionsIn += 1;
                            }
                        }
                    });
                    outgoingMoneyTitles.forEach(validEntry => {
                        if (log[itm].title.toString().toLowerCase().includes(validEntry)) {
                            if (log[itm].data.hasOwnProperty('money')) {
                                totalOutgoing += log[itm].data.money;
                                log[itm].value = formatter.format(log[itm].data.money);
                                keep = true;
                            } else if (log[itm].data.hasOwnProperty('worth')) {
                                totalOutgoing += log[itm].data.worth;
                                log[itm].value = formatter.format(log[itm].data.worth);
                                keep = true;
                            } else if (log[itm].data.hasOwnProperty('cost_total')) {
                                totalOutgoing += log[itm].data.cost_total;
                                log[itm].value = formatter.format(log[itm].data.cost_total);
                                keep = true;
                            } else if (log[itm].data.hasOwnProperty('money_lost')) {
                                totalOutgoing += log[itm].data.money_lost;
                                log[itm].value = formatter.format(log[itm].data.money_lost);
                                keep = true;
                            }
                            if (keep) {
                                log[itm].money = "outgoing";
                                transactionsOut += 1;
                            }
                        }
                    });
                    if (!keep) {
                        delete log[itm];
                    }
                    */
                });

                console.log("trades!!!!!!!!!!!1111");
                console.log(trades);

                return {
                    log: log,
                    totalIncoming: totalIncoming,
                    totalIncomingFormatted: formatter.format(totalIncoming),
                    totalOutgoing: totalOutgoing,
                    totalOutgoingFormatted: formatter.format(totalOutgoing),
                    balance: totalIncoming - totalOutgoing,
                    balanceFormatted: formatter.format(totalIncoming - totalOutgoing),
                    transactionsIn: transactionsIn,
                    transactionsOut: transactionsOut
                };

            } catch (e) {
                console.error("Error occured", e);
            }

            return {
                log: log,
                totalIncoming: 0,
                totalIncomingFormatted: formatter.format(0),
                totalOutgoing: 0,
                totalOutgoingFormatted: formatter.format(0),
                balance: 0,
                balanceFormatted: formatter.format(0),
                transactionsIn: 0,
                transactionsOut: 0
            };

        },
        refreshData(days) {
            /*this.fetchLog(days).then((log) => {
                if (log != null) {
                    console.log("Fetched log from Torn API! Saving to localStorage");
                    localStorage.setItem('trades', JSON.stringify(log));
                    this.log = this.filterLog(log);
                } else {
                    console.warn("Log is empty... API troubles?");
                }
            })*/

            let sectionMoney = document.getElementById('sectionMoney');
            sectionMoney.textContent = "Sorry, this feature is still under development.";
        }
    },
    mounted() {

        // Use cached data if it exists to ensure quick loading
        if (localStorage.getItem('trades') != null) {
            console.log("Found cached log!");
            let log = JSON.parse(localStorage.getItem('trades'));
            this.log = this.filterLog(log);
        } else {
            this.refreshData(1);
        }
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-chart-simple"></i> Trades</h1>


    <article id="sectionMoney" v-if="log != null">
        <figure>
            <table>
                <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Value</th>
                </tr>
                <tr v-for="entry in log.log" :key="entry.timestamp">
                    <td>{{ new Date(entry.timestamp * 1000).toUTCString() }}</td>
                    <td>{{ entry.category }}</td>
                    <td>{{ entry.title }}</td>
                    <td :class="entry.money === 'incoming' ? 'totals success' : 'totals danger'">{{ entry.value }}</td>
                </tr>

                <tr><td colspan="5"><hr></td></tr>

                <tr>
                    <td colspan="3">Total incoming</td>
                    <td class="totals success">{{ log.totalIncomingFormatted }}</td>
                </tr>
                <tr>
                    <td colspan="3">Total outgoing</td>
                    <td class="totals danger">{{ log.totalOutgoingFormatted }}</td>
                </tr>
                <tr>
                    <td colspan="3">Balance</td>
                    <td :class="log.balance > 0 ? 'totals success' : 'totals danger'">{{ log.balanceFormatted }}</td>
                </tr>

                <tr><td colspan="5"><hr></td></tr>

                <tr>
                    <td>Transactions</td>
                    <td class="centered success">Incoming<br>{{ log.transactionsIn }}</td>
                    <td class="centered danger">Outgoing<br>{{ log.transactionsOut }}</td>
                    <td class="centered">Total<br>{{ log.transactionsIn + log.transactionsOut }}</td>
                </tr>

            </table>
        </figure>
    </article>

    <article id="sectionMoney" v-else>
        Sorry, unable to fetch logs...
    </article>

    <div class="grid">
        <a href="#" id="btnFetchLog" role="button" @click="refreshData(1)">Today</a>
        <a href="#" id="btnFetchLog" role="button" @click="refreshData(7)">Last 7 days</a>
        <a href="#" id="btnFetchLog" role="button" @click="refreshData(30)">Last 30 days</a>
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