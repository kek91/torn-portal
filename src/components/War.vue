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
            factionData: null
        }
    },
    methods: {
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
        if (localStorage.getItem('hospitalTargetsFactionId')) {
            console.log("HospitalTargets: using cached data");
            this.factionId = localStorage.getItem('hospitalTargetsFactionId');
        }
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-skull-crossbones"></i> War<span id="currentFactionName"></span></h1>
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
                    <template v-if="data.status.state == 'Hospital'">
                        <td>{{ data.name }}</td>
                        <td>{{ data.level }}</td>
                        <td>{{ data.status.description }}</td>
                        <td>
                            {{
                                data.status.until - Math.round(Date.now() / 1000) > 60 ?
                                        Math.round((data.status.until - Math.round(Date.now() / 1000)) / 60) + '&nbsp;m' :
                                        Math.round(data.status.until - Math.round(Date.now() / 1000)) + '&nbsp;s'
                            }}
                        </td>
                        <td>
                            <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + id" target="blank">
                                <i class="fa-solid fa-gun fa-2xl"></i>
                            </a>
                        </td>
                    </template>
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