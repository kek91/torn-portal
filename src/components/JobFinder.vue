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
            companiesByType: null,
            companyId: 1,
            minRating: 7,
            jobs: null
        }
    },
    methods: {
        async fetchCompanies(id = null) {

            let loader = document.getElementsByClassName('loader')[0];

            try {
                loader.setAttribute('aria-busy', 'true');

                let url;
                if (id == null) {
                    url = `https://api.torn.com/torn/?selections=companies&comment=tornportal&key=${this.user.apiKey}`
                } else {
                    url = `https://api.torn.com/company/${id}?selections=companies&comment=tornportal&key=${this.user.apiKey}`
                }
                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok || data.hasOwnProperty('error')) {
                    if (data.hasOwnProperty('error')) {
                        throw `API Error: ${data.error.error}`;
                    }
                    throw `API Error: Unknown`;
                }

                loader.setAttribute('aria-busy', 'false');

                if (id == null) {
                    localStorage.setItem('companies', JSON.stringify(data.companies));
                    return data.companies;
                }
                return data.company;

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

        findJobs(e) {

            e.preventDefault();
            let loader = document.getElementsByClassName('loader')[0];
            //let companyId = document.getElementById('selectJobType').value;
            console.log(`Finding (ID: ${this.companyId}) with a minimum rating of ${this.minRating} that has available spots`);

            try {
                loader.setAttribute('aria-busy', 'true');
                this.fetchCompanies(this.companyId).then(data => {

                    // Now filter the data: Ignore those who are full or less rating than minimum
                    for (const k in data) {
                        if (
                                (data[k].employees_capacity - data[k].employees_hired) > 0 &&
                                (data[k].rating >= this.minRating)
                        ) {
                            // Keep this one!
                        } else {
                            delete data[k];
                        }
                    }
                    console.log("Companies matching search criteria: " + Object.keys(data).length);
                    this.companiesByType = data;
                })
            } catch (e) {
                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                loader.setAttribute('aria-busy', 'false');
            }
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
    <div class="loader"></div>

    <article v-if="companiesByType != null">
        <p class="danger center" v-if="Object.keys(companiesByType).length == 0">
            Sorry, couldn't find any available jobs.<br>
            Try another industry or consider lowering your minimum rating requirement.
        </p>
        <figure v-else>
            <table>
                <tr>
                    <th>Company name</th>
                    <th>Rating</th>
                    <th>Employees</th>
                    <th>Available spots</th>
                    <th>Age</th>
                    <th>Weekly income</th>
                </tr>
                <tr v-for="(data,id) in companiesByType" :key="id">
                    <td>
                        <a :href="`https://www.torn.com/joblist.php#/p=corpinfo&ID=${data.ID}`"
                           target="_blank">{{ data.name }}</a>
                    </td>
                    <td>{{ data.rating }} <i class="fa-solid fa-star fa-xs"></i></td>
                    <td>{{ data.employees_hired }}</td>
                    <td>{{ (data.employees_capacity - data.employees_hired) }}</td>
                    <td>{{ $filters.toNumberFormat(data.days_old) }}</td>
                    <td class="right">{{ $filters.toMoney(data.weekly_income) }}</td>
                </tr>
            </table>
        </figure>
    </article>

    <article>
        <form @submit="findJobs">
            <select id="selectJobType" v-model="companyId">
                <option v-for="(cp,id) in companies" :value="id">{{ cp.name }}</option>
            </select>
            <div v-if="companyId" v-for="(cp,id) in companies" :key="id">
                <table v-if="id == companyId">
                    <tr>
                        <th>Perk</th>
                        <th>Cost</th>
                        <th>Required</th>
                    </tr>
                    <tr v-for="special in cp.specials">
                        <td>{{ special.effect }}</td>
                        <td>{{ special.cost == 0 ? 'Passive' : special.cost + ' JP' }}</td>
                        <td>{{ special.rating_required }} <i class="fa-solid fa-star fa-xs"></i></td>
                    </tr>
                </table>
            </div>
            <label>
                Minimum rating: {{ minRating }} <i class="fa-solid fa-star fa-xs"></i>
                <input type="range" v-model="minRating" id="minStars" min="0" max="10" step="1">
            </label>
            <button type="submit" id="btnSubmitFindJobs">Find job openings</button>
        </form>
    </article>


</template>

<style scoped>
hr {
    border-top: 1px solid #333;
}
</style>