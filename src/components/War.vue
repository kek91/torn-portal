<script>

export default {
    name: 'War',
    props: {
        user: {
            type: Object,
            required: true
        },
        profile: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            factionId: null,
            factionData: null,
            factionMembers: null,
            factionIdMine: null,
            factionIdOpponent: null,
            factionNameMine: null,
            factionNameOpponent: null,
            rwScoreMine: null,
            rwScoreOpponent: null,
            windowWidth: window.innerWidth,
            intervalId: null
        }
    },
    methods: {

        toggleLoader(on) {
            try {
                let loader = document.getElementsByClassName('loader')[0];
                if (on) {
                    loader.setAttribute('aria-busy', 'true');
                } else {
                    loader.setAttribute('aria-busy', 'false');
                }
            } catch (e) {
                console.error("Could not toggle loader: ", e);
            }
        },

        async getChainInfo(factionId) {
            console.log("Fetching chain info for factionId: " + factionId);
            try {
                this.toggleLoader(true);
                const response = await fetch(`https://teknix.no/torn-portal/chain/${factionId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `ApiKey ${this.user.apiKey}`
                    }
                });
                const data = await response.json();
                this.toggleLoader(false);
                return data;
            } catch (e) {
                this.$notify({
                    title: "API error",
                    text: `${e}`,
                    type: "error"
                });
                this.toggleLoader(false);
                return null;
            }
        },

        async getWarInfo(factionId) {
            console.log("Fetching war info for factionId: " + factionId);
            try {
                this.toggleLoader(true);
                const response = await fetch(`https://teknix.no/torn-portal/war/${factionId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `ApiKey ${this.user.apiKey}`
                    }
                });
                const data = await response.json();
                this.toggleLoader(false);
                return data;
            } catch (e) {
                this.$notify({
                    title: "API error",
                    text: `${e}`,
                    type: "error"
                });
                this.toggleLoader(false);
                return null;
            }
        },

        sortFactionMembersByHospTime(members) {
            return members.sort((a, b) => {
                const aHospitalUntil = a.status.state === "Hospital" && a.status.until ? a.status.until : 0;
                const bHospitalUntil = b.status.state === "Hospital" && b.status.until ? b.status.until : 0;

                // 1. Primary sort: hospital time
                if (bHospitalUntil !== aHospitalUntil) {
                    return bHospitalUntil - aHospitalUntil;
                }

                // 2. Secondary sort: Traveling status
                const aTravel = a.status.state === "Traveling" || a.status.state === "Abroad" ? 0 : 1;
                const bTravel = b.status.state === "Traveling" || b.status.state === "Abroad" ? 0 : 1;

                if (bTravel !== aTravel) {
                    return bTravel - aTravel; // Traveling people first
                }

                // 3. Tertiary sort: level (descending)
                return b.level - a.level;
            });
        },

        activateTimers() {
            this.intervalId = setInterval(() => {
                let timers = document.getElementsByClassName('timer');
                console.log(`Updating timers for ${timers.length} players`);
                for (let i = 0; i < timers.length; i++) {

                    let tsUntil = timers[i].getAttribute('data-until');
                    // let tsUntil = (Date.now()/1000);
                    let tsNow = (Date.now() / 1000);
                    let sDiff = Math.round(tsUntil - tsNow);

                    let hh = Math.floor(sDiff / 3600);
                    let mm = Math.floor((sDiff - (hh * 3600)) / 60);
                    let ss = sDiff - (hh * 3600) - (mm * 60);
                    // hh = hh < 10 ? '0'+hh : hh;
                    // mm = mm < 10 ? '0'+mm : mm;
                    // ss = ss < 10 ? '0'+ss : ss;

                    if (sDiff > 3599) {
                        // timers[i].innerHTML = `${hh}h ${mm}m ${ss}s`;
                        timers[i].innerHTML = `${hh}h`;
                    }
                    else if (sDiff > 59) {
                        // timers[i].innerHTML = `${mm}m ${ss}s`;
                        timers[i].innerHTML = `${mm}m`;
                    }
                    else if (sDiff > 0) {
                        // timers[i].innerHTML = `${sDiff.toString()}s`;
                        timers[i].innerHTML = `${ss}s`;
                    }
                    else {
                        timers[i].innerHTML = 'Out!';
                        timers[i].parentElement.parentElement.style.backgroundColor = "rgba(10,250,10, 0.1)";
                        timers[i].parentElement.nextSibling.childNodes[0].className = 'primary';
                    }
                }
            }, 1000);
        },

        stopTimers() {
            clearInterval(this.intervalId);
            this.intervalId = null;
        },

        showHospitalTargets(e) {
            if (e) {
                e.preventDefault();
            }

            localStorage.setItem('hospitalTargetsFactionId', this.factionId);

            this.getWarInfo(this.factionId).then(data => {
                console.log(data);
                if (data.status === "war") {
                    this.factionData = data;
                    this.factionIdMine = data.factionIdMine;
                    this.factionNameMine = data.factionNameMine;
                    this.factionIdOpponent = data.factionIdOpponent;
                    this.factionNameOpponent = data.factionNameOpponent;
                    this.rwScoreMine = data.rwScoreMine;
                    this.rwScoreOpponent = data.rwScoreOpponent;
                    this.factionMembers = this.sortFactionMembersByHospTime(data.factionMembersOpponent.members);
                    document.getElementById('currentFactionName').innerHTML = `<span class="success">${this.factionNameMine} (${this.rwScoreMine})</span> vs <span class="danger">${this.factionNameOpponent} (${this.rwScoreOpponent})</span>`;
                    this.activateTimers();

                    // Get and show chain info as well
                    this.getChainInfo(this.factionIdMine).then(data => {
                        document.getElementById('currentFactionChain').innerHTML = `<code style="max-width:90%">
                        ${JSON.stringify(data)}</code>`;
                    });
                }
            });
        }
    },
    mounted() {

        if (localStorage.getItem('hospitalTargetsFactionId')) {
            if (localStorage.getItem('hospitalTargetsFactionId') !== "null") {
                this.factionId = localStorage.getItem('hospitalTargetsFactionId');
            }
        }

        this.showHospitalTargets();

        // Make sure we dont have any timers alrady running
        this.stopTimers();
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-skull-crossbones"></i> War</h1>
    <p class="center"><span id="currentFactionName"></span></p>
    <p class="center"><span id="currentFactionChain"></span></p>
    <div class="loader"></div>

    <article v-if="factionData != null">
        <figure>
            <table>
                <tr>
                    <th>Name</th>
                    <th> &nbsp; </th>
                    <th>Lvl</th>
                    <th>Desc</th>
                    <th> &nbsp; </th>
                    <th> &nbsp; </th>
                </tr>
                <tr v-for="(data, id) in factionMembers" :key="id">

                    <td>
                        <a :href="'https://www.torn.com/profiles.php?XID=' + data.id" target="blank">
                            {{ data.name }}
                        </a>
                    </td>

                    <td>
                        <span class="success" :data-tooltip="'Online - ' + data.last_action.relative"
                            v-if="data.last_action.status === 'Online'">
                            <i class="fa-solid fa-circle fa-2xs"></i>
                        </span>
                        <span class="warning" :data-tooltip="'Idle - ' + data.last_action.relative"
                            v-else-if="data.last_action.status === 'Idle'">
                            <i class="fa-solid fa-circle fa-2xs"></i>
                        </span>
                        <span class="danger" :data-tooltip="'Offline - ' + data.last_action.relative" v-else>
                            <i class="fa-solid fa-circle fa-2xs"></i>
                        </span>
                    </td>

                    <td>
                        {{ data.level }}
                    </td>

                    <td>
                        <span class="success" v-if="data.status.state === 'Okay'">{{ data.status.description }}</span>
                        <span class="info"
                            v-else-if="data.status.state === 'Traveling' || data.status.state === 'Abroad'">
                            <template v-if="this.windowWidth < 800">
                                Traveling
                            </template>
                            <template v-else>
                                {{ data.status.description }}
                            </template>
                        </span>
                        <span class="secondary" v-else-if="data.status.state === 'Fallen'">{{ data.status.description
                            }}</span>
                        <span class="danger" v-else-if="data.status.state === 'Hospital'">Hospital</span>
                        <span class="danger" v-else-if="data.status.state === 'Jail'">Jail</span>
                        <span class="secondary" v-else>Unknown</span>
                    </td>

                    <td v-if="data.status.state === 'Hospital' || data.status.state === 'Jail'">
                        <span class="timer" :data-until="data.status.until"></span>
                    </td>
                    <td v-else>
                        &nbsp;
                    </td>

                    <td class="center">
                        <template v-if="data.status.state !== 'Okay'">
                            <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + data.id" target="blank"
                                class="secondary">
                                <i class="fa-solid fa-gun fa-xl"></i>
                            </a>
                        </template>
                        <template v-else>
                            <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + data.id" target="blank"
                                class="primary">
                                <i class="fa-solid fa-gun fa-xl"></i>
                            </a>
                        </template>
                    </td>

                </tr>
            </table>
        </figure>
    </article>




    <article>
        <p>
            Use this tool to monitor the status of players currently in hospital.<br>
            Great for wars so you can instantly put them right back into the hospital where they belong!
        </p>
        <form @submit="showHospitalTargets">
            <input type="text" id="inputFactionId" v-model="factionId" placeholder="Faction ID...">
            <button type="submit" id="btnSubmitHospitalTargets">See targets</button>
        </form>
    </article>


</template>

<style scoped>
table th,
table td {
    padding: 8px;
}

table th,
table td {
    border-bottom: 1px solid #ccc;
}

table tr:hover {
    background: rgba(0, 0, 0, 0.05);
}
</style>