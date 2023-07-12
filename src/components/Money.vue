<script>

export default {
    name: 'Money',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            log: null
        }
    },
    methods: {
        async fetchLog() {

            this.log = null;
            let btnFetchLog = document.getElementById('btnFetchLog');

            try {
                btnFetchLog.setAttribute('aria-busy', 'true');

                const response = await fetch(`https://api.torn.com/user/?selections=log&key=${this.user.apiKey}`);
                const data = await response.json();

                if (data.hasOwnProperty('error')) {
                    throw `API Error: ${$data.error.error}`;
                }

                this.log = data;
                localStorage.setItem('log', JSON.stringify(data));
                btnFetchLog.setAttribute('aria-busy', 'false');

            } catch (e) {

                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                btnFetchLog.setAttribute('aria-busy', 'false');
            }
        },
        filterLog() {
            console.log(this.log);
            for (let i=0; i<this.log.length; i++) {
                console.log(`key: ${i}  val: ${this.log[i]} ... `);

            }
        }

    },
    mounted() {
        // Use cached data if it exists
        if (localStorage.getItem('log') != null) {
            this.log = JSON.parse(localStorage.getItem('log'));
            console.log("222");
            console.log(this.log);
        }
        else {
            this.fetchLog();
        }

        console.log("filterLog!");
        this.filterLog();
    }
}
</script>

<template>

    <h1>Money</h1>

    <article id="sectionMoney" v-if="log != null">

        <table>
            <tr v-for="entry in log.log" :key="entry.timestamp">
                <td>{{ new Date(entry.timestamp*1000).toISOString() }}</td>
                <td>{{ entry.title }}</td>
                <td>{{ entry.category }}</td>
                <td>{{ entry.data.total_cost }}</td>
            </tr>
        </table>


    </article>

    <a href="#" id="btnFetchLog" role="button" @click="fetchLog">Refresh</a>

</template>

<style scoped>

</style>