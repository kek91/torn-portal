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

                if(!response.ok || data.hasOwnProperty('error')) {
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

                localStorage.setItem('hospitalTargetsFactionId', factionId);
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
        showHospitalTargets(e) {
            e.preventDefault();
            this.fetchFactionUsers(this.factionId).then(data => {
                this.factionData = data;
                document.getElementById('currentFactionName').innerHTML = ` for ${data.name}`;
            });
        }
    },
    mounted() {

        // Get current faction details to see if we're in war
        this.fetchCurrentWarDetails().then(data => {
            console.log('fetch Current War Details');
            this.factionIdMine = data['ID'];
            this.factionNameMine = data['name'];
            console.log(data);
            if (data.hasOwnProperty('ranked_wars')) {
                for (let rankedWarId in data['ranked_wars']) {
                    let rw = data['ranked_wars'][rankedWarId];

                    for (let factionId in rw['factions']) {
                        let rwfac = rw['factions'][factionId];

                        if (rwfac['name'] !== this.factionNameMine) {
                            // Opponent faction:
                            console.log("RW Opponent: ");
                            console.log(rwfac);
                            this.factionIdOpponent = factionId;
                            this.factionNameOpponent = rwfac['name'];
                            this.rwScoreOpponent = rwfac['score'];
                        }
                        else {
                            this.rwScoreMine = rwfac['score'];
                        }

                    }

                }

                this.fetchFactionUsers(this.factionIdOpponent).then(data => {
                    this.factionData = data;
                    // document.getElementById('currentFactionName').innerHTML = ` for ${data.name}`;
                    document.getElementById('currentFactionName').innerHTML = `<span class="success">${this.factionNameMine} (${this.rwScoreMine})</span> vs <span class="danger">${this.factionNameOpponent} (${this.rwScoreOpponent})</span>`;

                });
            }
        });


        //
        // if (localStorage.getItem('hospitalTargetsFactionId')) {
        //     console.log("HospitalTargets: using cached data");
        //     this.factionId = localStorage.getItem('hospitalTargetsFactionId');
        // }
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
                    <th>Level</th>
                    <th>Description</th>
                    <th>Time left</th>
                    <th>Attack</th>
                </tr>
                <tr v-for="(data,id) in factionData.members" :key="id">

<!--                    <template v-if=""></template>-->

                        <td>
                            <a :href="'https://www.torn.com/profiles.php?XID=' + id" target="blank">
                                {{ data.name }}
                            </a> &nbsp;
                            <span class="success" data-tooltip="Online" v-if="data.last_action.status === 'Online'"><i class="fa-solid fa-circle fa-fade fa-2xs"></i></span>
                            <span class="warning" data-tooltip="Idle" v-if="data.last_action.status === 'Idle'"><i class="fa-solid fa-circle fa-2xs"></i></span>
                            <span class="danger" data-tooltip="Offline" v-if="data.last_action.status === 'Offline'"><i class="fa-solid fa-circle fa-2xs"></i></span>

<!--                            <small>{{ data.last_action.relative }}</small>-->
                        </td>
                        <td>{{ data.level }}</td>

                        <td>
                            <span class="success" v-if="data.status.state === 'Okay'">{{ data.status.description }}</span>
                            <span class="danger" v-if="data.status.state !== 'Okay'">{{ data.status.description }}</span>
                        </td>

                        <td v-if="data.status.state === 'Hospital'">
                            {{
                                data.status.until - Math.round(Date.now() / 1000) > 3600 ?
                                    Math.round((data.status.until - Math.round(Date.now() / 1000)) / 60 / 60) + '&nbsp;h' :
                                        data.status.until - Math.round(Date.now() / 1000) > 60 ?
                                        Math.round((data.status.until - Math.round(Date.now() / 1000)) / 60) + '&nbsp;m' :
                                        Math.round(data.status.until - Math.round(Date.now() / 1000)) + '&nbsp;s'
                            }}
                        </td>
                        <td v-else>
                            &nbsp;
                        </td>

                        <td>
                            <template v-if="data.status.state === 'Hospital'">
                                <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + id" target="blank" class="secondary">
                                    <i class="fa-solid fa-gun fa-2xl"></i>
                                </a>
                            </template>
                            <template v-else>
                                <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + id" target="blank" class="primary">
                                    <i class="fa-solid fa-gun fa-2xl fa-fade"></i>
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

</style>