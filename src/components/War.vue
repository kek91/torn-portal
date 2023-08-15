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
            setInterval(() => {
                console.log('Starting timers!');
                let timers = document.getElementsByClassName('timer');
                for (let i = 0; i < timers.length; i++) {
                    let s = parseInt(timers[i].innerHTML);
                    timers[i].innerHTML = s-1;
                }
            }, 1250);

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

                this.fetchFactionUsers(this.factionIdOpponent).then(data => {
                    this.factionData = data;
                    this.factionMembers = this.sortFactionMembersByHospTime(data.members);
                    document.getElementById('currentFactionName').innerHTML = `<span class="success">${this.factionNameMine} (${this.rwScoreMine})</span> vs <span class="danger">${this.factionNameOpponent} (${this.rwScoreOpponent})</span>`;
                    this.activateTimers();
                });
            }
        });

        if (localStorage.getItem('hospitalTargetsFactionId')) {
            console.log("HospitalTargets: using cached data");
            this.factionId = localStorage.getItem('hospitalTargetsFactionId');
        }
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
                    <th>Time left</th>
                    <th class="center">Attack</th>
                </tr>
                <!--<tr v-for="(data,id) in factionData.members" :key="id">-->
                <tr v-for="(data,id) in factionMembers" :key="id">

                    <!--                    <template v-if=""></template>-->

                    <td>
                        <a :href="'https://www.torn.com/profiles.php?XID=' + id" target="blank">
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
                        <span class="info" v-else-if="data[1].status.state === 'Traveling' || data[1].status.state === 'Abroad'">{{ data[1].status.description }}</span>
                        <span class="danger" v-else>{{ data[1].status.description }}</span>
                    </td>

                    <td v-if="data[1].status.state === 'Hospital' || data[1].status.state === 'Jail'">
                        <span class="timer">{{ Math.round(data[1].status.until - Math.round(Date.now() / 1000)) }}</span>s
                    </td>

                    <!--
                    {{
                            data[1].status.until - Math.round(Date.now() / 1000) > 3600 ?
                                    Math.round((data[1].status.until - Math.round(Date.now() / 1000)) / 60 / 60) + '&nbsp;h' :
                                    data[1].status.until - Math.round(Date.now() / 1000) > 60 ?
                                            Math.round((data[1].status.until - Math.round(Date.now() / 1000)) / 60) + '&nbsp;m' :
                                            Math.round(data[1].status.until - Math.round(Date.now() / 1000)) + '&nbsp;s'
                        }}
                    -->
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
                                <i class="fa-solid fa-gun fa-fade"></i>
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