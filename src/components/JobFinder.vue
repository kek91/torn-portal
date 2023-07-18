<script>

export default {
    name: 'JobFinder',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            companies: null,
            company: 'Hair Salon',
            minStars: 7,
            jobs: null
        }
    },
    methods: {
        async fetchCompanies() {

            let articleJobs = document.getElementById('articleJobs');

            try {
                articleJobs.setAttribute('aria-busy', 'true');

                const response = await fetch(`https://api.torn.com/torn/?selections=companies&comment=tornportal&key=${this.user.apiKey}`);
                const data = await response.json();

                if(!response.ok || data.hasOwnProperty('error')) {
                    if (data.hasOwnProperty('error')) {
                        throw `API Error: ${data.error.error}`;
                    }
                    throw `API Error: Unknown`;
                }

                localStorage.setItem('companies', JSON.stringify(data.companies));

                articleJobs.setAttribute('aria-busy', 'false');
                return data.companies;

            } catch (e) {

                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                articleJobs.setAttribute('aria-busy', 'false');
            }
            return null;
        },
        findJobs(e) {
            e.preventDefault();
        }
    },
    mounted() {
        if (localStorage.getItem('companies')) {
            console.log("Companies: using cached data");
            this.companies = JSON.parse(localStorage.getItem('companies'));
        } else {
            console.log("Companies: fetching from API");
            this.fetchCompanies().then(data => {
                this.companies = data;
            })
        }
    }
}
</script>

<template>

    <h1><i class="fa-solid fa-magnifying-glass-dollar"></i> Job Finder</h1>

    <article>
        <form @submit="findJobs">
            <select id="selectJobType" v-model="company">
                <option v-for="cp in companies">{{ cp.name }}</option>
            </select>
            <div v-if="company" v-for="cp in companies">
                <table v-if="cp.name == company">
                    <tr><th>Perk</th><th>Cost</th><th>Required</th></tr>
                    <tr v-for="special in cp.specials">
                        <td>{{ special.effect }}</td>
                        <td>{{ special.cost == 0 ? 'Passive' : special.cost + ' JP' }}</td>
                        <td>{{ special.rating_required }} <i class="fa-solid fa-star fa-xs"></i></td>
                    </tr>
                </table>
            </div>
            <label>
                Minimum rating: {{ minStars }} <i class="fa-solid fa-star fa-xs"></i>
                <input type="range" v-model="minStars" id="minStars" min="0" max="10" step="1">
            </label>
            <button type="submit" id="btnSubmitFindJobs">Find job openings</button>
        </form>
    </article>

    <article id="articleJobs" v-if="jobs">
<!--        <table v-if="companies != null">-->
<!--            <tr><td colspan="2" class="centered"><b>Private Companies</b><hr></td></tr>-->
<!--            <tr v-for="item in companies.jobpoints.companies">-->
<!--                <td>{{ item.name }}</td>-->
<!--                <td class="centered">{{ item.jobpoints }}</td>-->
<!--            </tr>-->
<!--            <br>-->
<!--            <tr><td colspan="2" class="centered"><b>Torn City Jobs</b><hr></td></tr>-->
<!--            <tr v-for="(val, key) in companies.jobpoints.jobs">-->
<!--                <td>{{ key.charAt(0).toUpperCase() + key.slice(1) }}</td>-->
<!--                <td class="centered">{{ val }}</td>-->
<!--            </tr>-->

<!--        </table>-->
    </article>


</template>

<style scoped>
hr {
    border-top:1px solid #333;
}
</style>