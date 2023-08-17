<script>

export default {
    name: 'War',
    props: {
        user: {
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

        async fetchCurrentWarDetails() {

            let loader = document.getElementsByClassName('loader')[0];

            try {
                loader.setAttribute('aria-busy', 'true');

                const response = await fetch(`https://api.torn.com/faction/?comment=tornportal&key=${this.user.apiKey}`);
                const data = await response.json();

                if (!response.ok || data.hasOwnProperty('error')) {
                    if (data.hasOwnProperty('error')) {
                        throw `API Error: ${data.error.error}`;
                    }
                    throw `API Error: Unknown`;
                }

                loader.setAttribute('aria-busy', 'false');
                return data;
            } catch (e) {
                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                loader.setAttribute('aria-busy', 'false');
            }
            return null;
        },

        async fetchFactionUsers(factionId) {

            let loader = document.getElementsByClassName('loader')[0];

            try {
                loader.setAttribute('aria-busy', 'true');

                const response = await fetch(`https://api.torn.com/faction/${factionId}?comment=tornportal&key=${this.user.apiKey}`);
                const data = await response.json();

                if (!response.ok || data.hasOwnProperty('error')) {
                    if (data.hasOwnProperty('error')) {
                        throw `API Error: ${data.error.error}`;
                    }
                    throw `API Error: Unknown`;
                }

                loader.setAttribute('aria-busy', 'false');

                return data;

            } catch (e) {

                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                loader.setAttribute('aria-busy', 'false');
            }
            return null;
        },

        sortFactionMembersByHospTime(members) {
            let factionMembersArr = Object.keys(members).map((key) => [key, members[key]]);
            let factionMembersSorted = factionMembersArr.sort((a, b) => {
                return parseInt(a[1].status.until) < parseInt(b[1].status.until) ? -1 : 1;
            });
            factionMembersSorted = factionMembersSorted.sort((a, b) => {
                if (a[1].status.state === 'Okay' && b[1].status.state !== 'Okay') {
                    return -1
                } else {
                    return 1;
                }
            });
            return factionMembersSorted;
        },

        activateTimers() {
            this.intervalId = setInterval(() => {
                let timers = document.getElementsByClassName('timer');
                console.log(`Updating timers for ${timers.length} players`);
                for (let i = 0; i < timers.length; i++) {

                    let tsUntil = timers[i].getAttribute('data-until');
                    // let tsUntil = (Date.now()/1000);
                    let tsNow = (Date.now()/1000);
                    let sDiff = Math.round(tsUntil - tsNow);

                    let hh = Math.floor(sDiff/3600);
                    let mm = Math.floor((sDiff-(hh*3600))/60);
                    let ss = sDiff-(hh*3600)-(mm*60);
                    // hh = hh < 10 ? '0'+hh : hh;
                    // mm = mm < 10 ? '0'+mm : mm;
                    // ss = ss < 10 ? '0'+ss : ss;

                    if (sDiff > 3599 ) {
                        timers[i].innerHTML = `${hh}h ${mm}m ${ss}s`;
                    }
                    else if (sDiff > 59) {
                        timers[i].innerHTML = `${mm}m ${ss}s`;
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
            e.preventDefault();

            localStorage.setItem('hospitalTargetsFactionId', this.factionId);

            this.fetchFactionUsers(this.factionId).then(data => {

                this.factionData = data;
                this.factionMembers = this.sortFactionMembersByHospTime(data.members);
                document.getElementById('currentFactionName').innerHTML = `Targets in <b>${data.name}</b>`;
                this.activateTimers();
            });
        }
    },
    mounted() {

        // Get current faction details to see if we're in war
        this.fetchCurrentWarDetails().then(data => {
            this.factionIdMine = data['ID'];
            this.factionNameMine = data['name'];
            if (data.hasOwnProperty('ranked_wars')) {
                for (let rankedWarId in data['ranked_wars']) {
                    let rw = data['ranked_wars'][rankedWarId];

                    for (let factionId in rw['factions']) {
                        let rwfac = rw['factions'][factionId];

                        if (rwfac['name'] !== this.factionNameMine) {
                            // Opponent faction:
                            this.factionIdOpponent = factionId;
                            this.factionNameOpponent = rwfac['name'];
                            this.rwScoreOpponent = rwfac['score'];
                        } else {
                            this.rwScoreMine = rwfac['score'];
                        }

                    }

                }

                if (this.factionIdOpponent !== null) {
                    this.fetchFactionUsers(this.factionIdOpponent).then(data => {
                        this.factionData = data;
                        this.factionMembers = this.sortFactionMembersByHospTime(data.members);
                        document.getElementById('currentFactionName').innerHTML = `<span class="success">${this.factionNameMine} (${this.rwScoreMine})</span> vs <span class="danger">${this.factionNameOpponent} (${this.rwScoreOpponent})</span>`;
                        this.activateTimers();
                    });
                }
            }
        });

        if (localStorage.getItem('hospitalTargetsFactionId')) {
            this.factionId = localStorage.getItem('hospitalTargetsFactionId');
        }

        // Make sure we dont have any timers alrady running
        this.stopTimers();
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-skull-crossbones"></i> War</h1>
    <h2 class="center"><span id="currentFactionName"></span></h2>
    <div class="loader"></div>

    <article v-if="factionData != null">
        <figure>
            <table>
                <tr>
                    <th>Name</th>
                    <th> &nbsp; </th>
                    <th>Level</th>
                    <th>Description</th>
                    <th>Timer</th>
                    <th class="center">Attack</th>
                </tr>
                <!--<tr v-for="(data,id) in factionData.members" :key="id">-->
                <tr v-for="(data,id) in factionMembers" :key="id">

                    <!--                    <template v-if=""></template>-->

                    <td>
                        <a :href="'https://www.torn.com/profiles.php?XID=' + data[0]" target="blank">
                            {{ data[1].name }}
                        </a>
                    </td>

                    <td>
                        <span class="success" :data-tooltip="'Online - ' + data[1].last_action.relative" v-if="data[1].last_action.status === 'Online'">
                            <i class="fa-solid fa-circle fa-2xs"></i>
                        </span>
                        <span class="warning" :data-tooltip="'Idle - ' + data[1].last_action.relative" v-else-if="data[1].last_action.status === 'Idle'">
                            <i class="fa-solid fa-circle fa-2xs"></i>
                        </span>
                        <span class="danger" :data-tooltip="'Offline - ' + data[1].last_action.relative" v-else>
                            <i class="fa-solid fa-circle fa-2xs"></i>
                        </span>
                    </td>

                    <td>
                        {{ data[1].level }}
                    </td>

                    <td>
                        <span class="success" v-if="data[1].status.state === 'Okay'">{{ data[1].status.description }}</span>
                        <span class="info" v-else-if="data[1].status.state === 'Traveling' || data[1].status.state === 'Abroad'">
                            <template v-if="this.windowWidth < 800">
                                Traveling
                            </template>
                            <template v-else>
                                {{ data[1].status.description }}
                            </template>
                        </span>
                        <span class="secondary" v-else-if="data[1].status.state === 'Fallen'">{{ data[1].status.description }}</span>
                        <span class="danger" v-else-if="data[1].status.state === 'Hospital'">Hospital</span>
                        <span class="danger" v-else-if="data[1].status.state === 'Jail'">Jail</span>
                        <span class="secondary" v-else>Unknown</span>
                    </td>

                    <td v-if="data[1].status.state === 'Hospital' || data[1].status.state === 'Jail'">
                        <span class="timer" :data-until="data[1].status.until"></span>
                    </td>
                    <td v-else>
                        &nbsp;
                    </td>

                    <td class="center">
                        <template v-if="data[1].status.state !== 'Okay'">
                            <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + id" target="blank"
                               class="secondary">
                                <i class="fa-solid fa-gun"></i>
                            </a>
                        </template>
                        <template v-else>
                            <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + id" target="blank"
                               class="primary">
                                <i class="fa-solid fa-gun"></i>
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

table th, table td {
    padding:2px;
}
table th, table td {
    border-bottom:1px solid #ccc;
}
table tr:hover {
    background:rgba(0,0,0,0.05);
}

</style>