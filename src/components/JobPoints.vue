<script>

export default {
    name: 'JobPoints',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            jobPoints: null
        }
    },
    methods: {
        async fetchJobPoints() {

            let articleJobPoints = document.getElementById('articleJobPoints');

            try {
                articleJobPoints.setAttribute('aria-busy', 'true');

                const response = await fetch(`https://api.torn.com/user/?selections=jobpoints&comment=tornportal&key=${this.user.apiKey}`);
                const data = await response.json();

                if(!response.ok || data.hasOwnProperty('error')) {
                    if (data.hasOwnProperty('error')) {
                        throw `API Error: ${data.error.error}`;
                    }
                    throw `API Error: Unknown`;
                }

                localStorage.setItem('jobPoints', JSON.stringify(data));

                articleJobPoints.setAttribute('aria-busy', 'false');
                return data;

            } catch (e) {

                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                articleJobPoints.setAttribute('aria-busy', 'false');
            }
            return null;
        }
    },
    mounted() {
        if (localStorage.getItem('jobPoints')) {
            console.log("JobPoints: using cached data");
            this.jobPoints = JSON.parse(localStorage.getItem('jobPoints'))
        } else {
            console.log("JobPoints: fetching from API");
            this.fetchJobPoints().then(data => {
                this.jobPoints = data;
            })
        }
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-suitcase"></i> Job Points</h1>

    <article id="articleJobPoints">
        <table v-if="jobPoints != null">
            <tr><td colspan="2" class="centered"><b>Private Companies</b><hr></td></tr>
            <tr v-for="item in jobPoints.jobpoints.companies">
                <td>{{ item.name }}</td>
                <td class="centered">{{ item.jobpoints }}</td>
            </tr>
            <br>
            <tr><td colspan="2" class="centered"><b>Torn City Jobs</b><hr></td></tr>
            <tr v-for="(val, key) in jobPoints.jobpoints.jobs">
                <td>{{ key.charAt(0).toUpperCase() + key.slice(1) }}</td>
                <td class="centered">{{ val }}</td>
            </tr>

        </table>
    </article>

    <a href="#" id="btnFetchJP" role="button" @click="fetchJobPoints()">Refresh</a>


</template>

<style scoped>
hr {
    border-top:1px solid #333;
}
</style>