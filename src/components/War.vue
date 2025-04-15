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
            intervalId: null,
            chainIntervalId: null,
            chainStart: null,
            myBattlestats: null,
            myBattlestatsInput: null,
            myBattleStatsResult: null,
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
                        // timers[i].parentElement.parentElement.style.backgroundColor = "rgba(10,250,10, 0.1)";
                        timers[i].parentElement.parentElement.style.setProperty('background-color', 'rgba(10,250,10, 0.1)', 'important');
                        timers[i].parentElement.nextSibling.childNodes[0].className = 'primary';
                    }
                }
            }, 1000);
        },
        activateChainTimer() {
            this.chainIntervalId = setInterval(() => {
                console.log(`Updating chain timer`);
                
                let timer = document.querySelector('.chainTimer');
                let tsUntil = timer.getAttribute('data-timeout');

                // let tsUntil = (Date.now()/1000);
                let tsNow = (Date.now() / 1000);
                let sDiff = Math.round(tsUntil - tsNow);

                let hh = Math.floor(sDiff / 3600);
                let mm = Math.floor((sDiff - (hh * 3600)) / 60);
                let ss = sDiff - (hh * 3600) - (mm * 60);

                if (sDiff > 179) {
                    timer.classList = 'chainTimer success';
                    timer.innerHTML = `${mm}m ${ss % 60}s`;
                } else if (sDiff > 119) {
                    timer.classList = 'chainTimer warning';
                    timer.innerHTML = `${mm}m ${ss % 60}s`;
                } else if (sDiff > 0) {
                    timer.classList = 'chainTimer danger';
                    timer.innerHTML = `${ss}s`;
                } else {
                    timer.classList = 'chainTimer secondary';
                    timer.innerHTML = 'Ended!';
                    this.stopChainTimer();
                    setTimeout(() => {
                        this.showChainInfo();
                    }, 1000);
                }
                
            }, 1000);
        },

        stopTimers() {
            clearInterval(this.intervalId);
            this.intervalId = null;
        },
        stopChainTimer() {
            clearInterval(this.chainIntervalId);
            this.chainIntervalId = null;
        },

        async resetHospitalTargetsToMyFaction() {
            this.factionId = this.profile.faction.faction_id;
            await this.showHospitalTargets();
        },

        async showHospitalTargets(e) {
            if (e) {
                e.preventDefault();
            }

            try {

                localStorage.setItem('hospitalTargetsFactionId', this.factionId);

                const el = document.getElementById('currentFactionName');

                this.toggleLoader(true);
                this.stopTimers();

                /* Reset existing data */
                this.factionData = null;
                el.innerHTML = `<span class="info">Loading war info...</span>`;

                this.getWarInfo(this.factionId).then(async data => {
                    this.factionData = data;
                    this.factionIdMine = data.factionIdMine;
                    this.factionNameMine = data.factionNameMine;
                    this.factionMembers = this.sortFactionMembersByHospTime(data.factionMembersOpponent.members);

                    this.factionMembers.forEach(async member => {
                        member.bstats = { battlestats: 0 }; // Set an initial value to avoid vue errors later on
                        const bstats = await this.fetchBattlestats(member.id) || { battlestats: 0 };
                        member.bstats = bstats;
                    });

                    // const promises = this.factionMembers.map(async member => {
                    //     const bstats = await this.fetchBattlestats(member.id) || {battlestats:0};
                    //     return { ...member, bstats }; // Return a new object with bstats
                    // });

                    // this.factionMembers = await Promise.all(promises);
                    
                    if (data.status === "war") {
                        this.factionIdOpponent = data.factionIdOpponent;
                        this.factionNameOpponent = data.factionNameOpponent;
                        this.rwScoreMine = data.rwScoreMine;
                        this.rwScoreOpponent = data.rwScoreOpponent;
                        el.innerHTML = `<span class="success">${this.factionNameMine} (${ this.$filters.toShortNumber(this.rwScoreMine) })</span> 
                        vs 
                        <span class="danger">${this.factionNameOpponent} (${this.$filters.toShortNumber(this.rwScoreOpponent)})</span>`;
                    } else {    
                        el.innerHTML = `<span class="success">${this.factionNameMine}</span><br>Not currently in war`;
                    }
                    this.activateTimers();
                    this.showChainInfo();
                    this.toggleLoader(false);
                }).catch(e => {
                    console.error("Error fetching war info: ", e);
                    this.$notify({
                        title: "Error",
                        text: `${e}`,
                        type: "error"
                    });
                    this.toggleLoader(false);
                });
            } catch(e) {
                console.error("Error occurred when getting war info: ", e);
            }
        },

        showChainInfo() {

            this.stopChainTimer();

            try {

                this.toggleLoader(true);

                const el = document.getElementById('currentFactionChain');

                if (this.factionIdMine === null || this.factionIdMine === undefined) {
                    console.error("Faction ID is null");
                    return;
                }
                el.innerHTML = `<span class="info">Loading chain info...</span>`;
                this.getChainInfo(this.factionIdMine).then(data => {
                    this.toggleLoader(false);
                    if (data && data.chain && data.chain.current > 0) {

                        const chainReportUrl = `https://www.torn.com/war.php?step=chainreport&chainID=${data.chain.id}`;
                        
                        if (data.chain.cooldown > 0) {
                            el.innerHTML = `Chain is in cooldown!<br>
                            ${data.chain.current}/${data.chain.max}<br>
                            <a href="${chainReportUrl}" target="_blank">#${data.chain.id}</a>`;
                            this.stopChainTimer();
                            return;
                        }

                        el.innerHTML = `<span class="info">Chain active!</span><br>
                        ${data.chain.current}/${data.chain.max}<br>
                        ${data.chain.max-data.chain.current} hits until bonus!<br>
                        <b><span class="chainTimer" data-timeout="${data.chain.end}">${Math.floor(data.chain.timeout/60)}m ${Math.floor(data.chain.timeout % 60)}s</span></b>`;

                        this.activateChainTimer();

                    } else {
                        el.innerHTML = `<span>No active chain</span>`;
                    }
                }).catch(e => {
                    console.error("Error fetching chain info: ", e);
                    this.$notify({
                        title: "Error",
                        text: `${e}`,
                        type: "error"
                    });
                    this.toggleLoader(false);
                });
            } catch (e) {
                console.error("Could not output chain info: ", e);
            }
        },

        async generateBattlestats(userid) {

            return new Promise(resolve => {
                if (!userid) {
                    console.log("userid is not set");
                    resolve(null);
                }

                fetch(`https://teknix.no/battlestats/${userid}/${this.user.apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.hasOwnProperty('battlestats')) {
                        resolve(data);
                    } else {
                        resolve({
                            "error": "API error from tornhelper-node",
                            "timestamp": Date.now()
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    resolve({
                        "error": "API error from tornhelper-node",
                        "timestamp": Date.now()
                    });
                });
            });
        },

        async fetchBattlestats(userid = null) {

            if (!userid) {
                console.error("Missing torn userid");
                return;
            }

            /** Check if we have cached bstats */
            let bstats = JSON.parse(localStorage.getItem(`battlestats_${userid}`));
            if (bstats && bstats.hasOwnProperty('battlestats')) {
                if (((Date.now() / 1000) - bstats.timestamp) > (60 * 60 * 24 * 30)) {
                    /** Old prediction is over a month old */
                    console.log('Old prediction is over a month old, fetching new prediction');
                    bstats = await this.generateBattlestats(userid);
                    console.log(bstats);
                    if (bstats.hasOwnProperty('battlestats')) {
                        localStorage.setItem(`battlestats_${userid}`, JSON.stringify(bstats));
                        console.log(`Saved new prediction (${JSON.stringify(bstats)}) for userid: ${userid} to localStorage`);
                    }
                }
            } else {
                /** No predictions */
                bstats = await this.generateBattlestats(userid);
                if (bstats.hasOwnProperty('battlestats')) {
                    localStorage.setItem(`battlestats_${userid}`, JSON.stringify(bstats));
                    console.log(`Saved new prediction (${JSON.stringify(bstats)}) for userid: ${userid} to localStorage`);
                }
            }
            return bstats;
        },

        processMyBattlestats() {
            const value = this.myBattlestatsInput.toLowerCase();
            const numberPart = parseFloat(value);
            const unitPart = value.replace(/^[+-]?\d+(\.\d+)?/, '');

            if (!isNaN(numberPart)) {
                switch (unitPart) {
                case 'k':
                    this.myBattlestats = numberPart * 1000;
                    break;
                case 'm':
                    this.myBattlestats = numberPart * 1000000;
                    break;
                case 'b':
                    this.myBattlestats = numberPart * 1000000000;
                    break;
                default:
                    this.myBattlestats = numberPart;
                    break;
                }
            } else {
                this.myBattlestats = null;
            }
            this.saveMyBattlestats();
        },
        saveMyBattlestats() {
            if(this.myBattlestats !== null) {
                localStorage.setItem('myBattlestats', this.myBattlestats);
                this.myBattleStatsResult = `<span class="success">Saved: <b>${this.$filters.toNumberFormat(this.myBattlestats)}</b></span>`;
            }
        },
        loadMyBattlestats() {
            try {
                this.myBattlestats = (localStorage.getItem('myBattlestats') || 0);
                this.myBattlestatsInput = this.$filters.shortenBs(this.myBattlestats);
            } catch(e) {
                console.error("Could not load myBattlestats");
            }
        },

        getBsClass(enemyBs) {
            const ratio = enemyBs / this.myBattlestats;

            if (ratio >= 1.0) {
                return 'th-danger';
            } else if (ratio >= 0.8) {
                return 'th-warning';
            } else if (ratio >= 0.6) {
                return 'th-success';
            } else {
                return 'th-secondary';
            }
        }

    },
    async mounted() {


        try {
            this.factionId = localStorage.getItem('hospitalTargetsFactionId');
        } catch(e) {
            console.error("Could not set factionId from localstorage, probably not used this tool before");
        }
        this.loadMyBattlestats();
        await this.showHospitalTargets();

        // Make sure we dont have any timers alrady running
        this.stopTimers();
        this.stopChainTimer();
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-skull-crossbones"></i> War</h1>
    
    <div role="group">
        <button @click="showHospitalTargets">&#8635; Members</button>
        <button @click="showChainInfo">&#8635; Chain</button>
    </div>

    <p class="center"><span id="currentFactionName"></span></p>
    <p class="center"><span id="currentFactionChain"></span></p>
    <div class="loader"></div>

    <article v-if="factionData != null">
        <figure class="overflow-auto">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th> &nbsp; </th>
                        <th>Lvl</th>
                        <th>Stats</th>
                        <th>Desc</th>
                        <th> &nbsp; </th>
                        <th> &nbsp; </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, id) in factionMembers" :key="id">

                        <td>
                            <a :href="'https://www.torn.com/profiles.php?XID=' + data.id" target="blank">
                                <template v-if="this.windowWidth < 375">
                                    {{ data.name.substring(0,6) }}
                                </template>
                                <template v-else-if="this.windowWidth < 420">
                                    {{ data.name.substring(0,10) }}
                                </template>
                                <template v-else>
                                    {{ data.name }}
                                </template>
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
                            <span :class="'th-bsp ' + getBsClass(data.bstats.battlestats || 0)">{{ $filters.shortenBs(data.bstats.battlestats || 0) }}</span>
                        </td>

                        <td>
                            <span class="success" v-if="data.status.state === 'Okay'">{{ data.status.description }}</span>
                            <span class="info"
                                v-else-if="data.status.state === 'Traveling' || data.status.state === 'Abroad'">
                                <template v-if="this.windowWidth < 800">
                                    Travel
                                </template>
                                <template v-else>
                                    {{ data.status.description }}
                                </template>
                            </span>
                            <span class="secondary" v-else-if="data.status.state === 'Fallen'">{{ data.status.description
                                }}</span>
                            <span class="danger" v-else-if="data.status.state === 'Hospital'">Hosp</span>
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
                </tbody>
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
            <button type="button" class="secondary" v-on:click="resetHospitalTargetsToMyFaction">Reset</button>
        </form>
    </article>

    <article>
        <p>
            If you wish to colorize the battlestats estimation (compared to yours),
            then enter your battlestats in the field below.
        </p>
        <form @submit.prevent="saveMyBattlestats">
            <input type="text" v-model="myBattlestatsInput" v-on:input="processMyBattlestats" placeholder="Enter number or shortcut (i.e. 50k, 200m, 1.2b)">
            <span v-html="myBattleStatsResult" style="display:block;"></span>
        </form>
        <hr>
        <p>
            Color legend:<br>
            <span class="th-bsp th-danger" style="width:100%;"> Strong: More than 100% of your stats </span>
            <span class="th-bsp th-warning" style="width:100%;"> Fair: Up to 100% of your stats </span>
            <span class="th-bsp th-success" style="width:100%;"> Easy: Up to 80% of your stats</span>
            <span class="th-bsp th-secondary" style="width:100%;"> Weak: Less than 60% of your stats</span>
        </p>
    </article>


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
    width:48px;
    height:24px;
    display:block;
    font-size:0.8rem;
    font-weight:bold;
    line-height:24px;
    text-align:center;
    overflow:hidden;
    color:#000 !important;
}

.th-danger {
    border:1px solid red;
    background:rgba(255,0,0,0.2);
}
.th-warning {
    border:1px solid orange;
    background:rgba(255,200,100,0.2)
}
.th-success {
    border:1px solid green;
    background:rgba(0,255,0,0.2)
}
.th-secondary {
    border:1px solid #999;
    background:rgba(0, 0, 0, 0.2);
}
</style>