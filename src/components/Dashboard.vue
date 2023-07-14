<script>

export default {
    name: 'Dashboard',
    props: {
        user: {
            type: Object,
            required: true
        },
        casinoWatcher: {
            type: Number,
            required: false
        }
    },
    data() {
        return {
            profile: null
        }
    },
    emits: [
        "setRouter"
    ],
    methods: {
        async fetchProfile() {

            this.profile = null;
            let btnFetchProfile = document.getElementById('btnFetchProfile');

            try {
                btnFetchProfile.setAttribute('aria-busy', 'true');

                const response = await fetch(`https://api.torn.com/user/?selections=profile&key=${this.user.apiKey}`);
                const data = await response.json();

                if(!response.ok || data.hasOwnProperty('error')) {
                    if (data.hasOwnProperty('error')) {
                        throw `API Error: ${data.error.error}`;
                    }
                    throw `API Error: Unknown`;
                }

                this.profile = data;
                localStorage.setItem('profile', JSON.stringify(data));
                btnFetchProfile.setAttribute('aria-busy', 'false');

            } catch (e) {

                this.$notify({
                    title: "Torn API error",
                    text: `${e}`,
                    type: "error"
                });
                btnFetchProfile.setAttribute('aria-busy', 'false');
            }
        },
        ageInHumanOutput(age) {
            if (age >= 365) {
                return Math.round(age/365) + ' year' + (Math.round(age/365) > 1 ? 's' : '');
            }
            else if(age >= 28) {
                return Math.round(age/28) + ' month' + (Math.round(age/28) > 1 ? 's' : '');
            }
            else {
                return age + ' day' + (age > 1 ? 's' : '');
            }
        }

    },
    mounted() {
        // Use cached profile if it exists
        if (localStorage.getItem('profile') != null) {
            this.profile = JSON.parse(localStorage.getItem('profile'));
        }
        else {
            this.fetchProfile();
        }
    }
}
</script>

<template>

    <h1><font-awesome-icon icon="fa-solid fa-house" /> Dashboard</h1>

    <div class="grid">
        <a href="#" @click="this.$emit('setRouter', 'money')" role="button" class="secondary">
            Money Log
        </a>
        <a href="#" @click="this.$emit('setRouter', 'casinowatcher')" role="button" class="secondary">
            Casino Watcher
            <span class="danger" v-if="casinoWatcher != null">*</span>
        </a>
        <a href="#" @click="this.$emit('setRouter', 'dashboard')" role="button" class="secondary" disabled="true" aria-disabled="true">TBA</a>
        <a href="#" @click="this.$emit('setRouter', 'dashboard')" role="button" class="secondary" disabled="true" aria-disabled="true">TBA</a>
        <a href="#" @click="this.$emit('setRouter', 'dashboard')" role="button" class="secondary" disabled="true" aria-disabled="true">TBA</a>
    </div>

    <article id="sectionDashboard" v-if="profile != null">
        <table>
            <tr><td>Name</td><td><a :href="`https://www.torn.com/profiles.php?XID=${user.id}`" target="_blank">{{ user.name }} [{{ user.id }}]</a></td></tr>
            <tr><td>Rank</td><td>{{ profile.rank }}</td></tr>
            <tr><td>Level</td><td>{{ profile.level }}</td></tr>
            <tr><td>Age</td><td>{{ profile.age }} ({{ ageInHumanOutput(profile.age) }})</td></tr>
            <tr><td>Levels gained pr day</td><td>{{ (parseInt(profile.level) / parseInt(profile.age)).toFixed(3) }}</td></tr>
            <tr><td>Faction</td><td><a :href="`https://www.torn.com/factions.php?step=profile&ID=${profile.faction.faction_id}&referredFrom=${profile.player_id}`" target="_blank">[{{ profile.faction.faction_tag }}] {{ profile.faction.faction_name }}</a></td></tr>
            <tr><td>Friends</td><td class="success">{{ profile.friends }}</td></tr>
            <tr><td>Enemies</td><td class="danger">{{ profile.enemies }}</td></tr>
        </table>
    </article>

    <article v-else>
        Sorry, unable to fetch data...
    </article>

    <a href="#" id="btnFetchProfile" role="button" @click="fetchProfile">Refresh</a>

</template>
