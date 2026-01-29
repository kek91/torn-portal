<script>
import { fetchFromTornViaProxy } from '@/utils/tornProxy.js';
import { sendNotification, enableNotifications } from '@/utils/notificationUtils.js';

export default {
    name: 'Retals',
    props: {
        user: {
            type: Object,
            required: true
        },
        profile: {
            type: Object,
            required: true
        },
        isDev: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            intervalId: null,
            intervalId2: null,
            refreshTimersFailed: 0,
            attacks: [],
            validRetals: [],
            lastChecked: null,
            now: Date.now(),
            notifiedRetals: new Set()
        }
    },
    computed: {
        secondsSinceLastCheck() {
            if (!this.lastChecked) return 0;
            const seconds = Math.floor((this.now - this.lastChecked) / 1000);
            return Math.max(0, seconds);
        }
    },
    methods: {

        filterValidRetals(attacks) {
            const now = Math.floor(Date.now() / 1000); // current time in seconds
            const FIVE_MINUTES = 300; // 5 minutes in seconds

            return attacks.filter(attack => {
                // Must have an attacker (not null)
                if (attack.attacker === null) {
                    return false;
                }

                // Must be done within the last 5 minutes
                const timeSinceEnded = now - attack.ended;
                if (timeSinceEnded > FIVE_MINUTES) {
                    return false;
                }

                return true;
            });
        },

        async checkIncomingAttacks() {

            try {
                
                let element = document.getElementById('retals-content');
                
                element.setAttribute('aria-busy', 'true');

                const url = `https://api.torn.com/v2/faction/attacks?filters=incoming&limit=10&sort=DESC&comment=TornPortal`;
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `ApiKey ${this.user.apiKey}`
                }
                const responsedata = await fetchFromTornViaProxy(url, headers);
                
                console.log(responsedata);

                // Store all attacks and filter valid retals
                this.attacks = responsedata.attacks || [];
                this.validRetals = this.filterValidRetals(this.attacks);

                // Check for new retals and send notifications (only 1)
                let notified = false;
                this.validRetals.forEach(attack => {
                    if (!this.notifiedRetals.has(attack.id)) {
                        if (!notified) {
                            sendNotification(attack);
                        }
                        notified = true;
                        this.notifiedRetals.add(attack.id);
                    }
                });
                
                this.lastChecked = Date.now();

                // sendNotification({   // Test notification
                //     attacker: { name: 'Test Attacker', level: 100 },
                //     defender: { name: 'Test Defender' },
                //     result: 'Test attack result'
                // });

                element.setAttribute('aria-busy', 'false');

            } catch (e) {

                // this.$notify({
                //     title: "Retals - Torn API error",
                //     text: `${e}`,
                //     type: "error"
                // });
                console.error(e);
            }
            return null;
        },

    },
    async mounted() {
        // Fetch initial data
        await this.checkIncomingAttacks();

        // Set up periodic refresh for attacks
        this.intervalId = setInterval(async () => {
            await this.checkIncomingAttacks();
        }, 30000); // Refresh every 30 seconds

        // Update current time every second for dynamic counter
        this.intervalId2 = setInterval(() => {
            this.now = Date.now();
        }, 1000);

        enableNotifications();
    },

    onBeforeUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.intervalId2) {
            clearInterval(this.intervalId2);
            this.intervalId2 = null;
        }
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-skull-crossbones"></i> Retals</h1>

    <div id="retals-content">
        <div v-if="validRetals.length === 0" class="info">
        </div>

        <div v-else>
            <p class="danger"><strong>{{ validRetals.length }} potential retals!</strong></p>
            <table>
                <thead>
                    <tr>
                        <th>Attacker</th>
                        <th>Level</th>
                        <th>Faction</th>
                        <th>Target</th>
                        <th>Result</th>
                        <th>Time Ago</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="attack in validRetals" :key="attack.id">
                        <td>
                            <a :href="`https://www.torn.com/profiles.php?XID=${attack.attacker.id}`" target="_blank">
                                {{ attack.attacker.name }}
                            </a>
                        </td>
                        <td>{{ attack.attacker.level }}</td>
                        <td>{{ attack.attacker.faction.name }}</td>
                        <td>
                            <a :href="`https://www.torn.com/profiles.php?XID=${attack.defender.id}`" target="_blank">
                                {{ attack.defender.name }}
                            </a>
                        </td>
                        <td>{{ attack.result }}</td>
                        <td>{{ Math.floor((Math.floor(Date.now() / 1000) - attack.ended) / 60) }} min ago</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <i v-if="lastChecked !== null">Last checked {{ secondsSinceLastCheck }} second{{ secondsSinceLastCheck !== 1 ? 's' : '' }} ago</i>
    <i v-else>Checking...</i>

    <!-- <button id="btnFetchLog" @click="checkIncomingAttacks">Check Incoming Attacks</button>   -->


</template>

<style scoped>
table th,
table td {
    padding: 8px 2px;
}

table th,
table td {
    border-bottom: 1px solid #ccc;
}

table tr:hover {
    background: rgba(0, 0, 0, 0.05);
}

.th-bsp {
    width: 48px;
    height: 24px;
    display: block;
    font-size: 0.8rem;
    font-weight: normal;
    line-height: 24px;
    text-align: center;
    overflow: hidden;
    color: #000 !important;
}

.th-danger {
    /* border:1px solid darkred; */
    background: tomato;
}

.th-warning {
    /* border:1px solid darkorange; */
    background: sandybrown;
}

.th-success {
    /* border:1px solid darkgreen; */
    background: limegreen;
}

.th-secondary {
    /* border:1px solid darkgray; */
    background: lightgray;
}

.tr-bg-out > td {
    background-color: rgba(100, 250, 100, 0.1) !important;
}

.th-difficulty-0 { background: #999999; }
.th-difficulty-1 { background: #c8facc; }
.th-difficulty-2 { background: #bbf451; }
.th-difficulty-3 { background: #ffe864; }
.th-difficulty-4 { background: #ffb76a; }
.th-difficulty-5 { background: #ff7a7a; }
.th-difficulty-6 { background: #ff4b4b; }

.th-difficulty-0:hover { background: #99999999; }
.th-difficulty-1:hover { background: #c8facc99; }
.th-difficulty-2:hover { background: #bbf45199; }
.th-difficulty-3:hover { background: #ffe86499; }
.th-difficulty-4:hover { background: #ffb76a99; }
.th-difficulty-5:hover { background: #ff7a7a99; }
.th-difficulty-6:hover { background: #ff4b4b99; }

</style>