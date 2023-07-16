<script>
import Vue3TagsInput from 'vue3-tags-input';

export default {
    name: 'CasinoWatcher',
    components: {
        Vue3TagsInput,
    },
    props: {
        user: {
            type: Object,
            required: true
        },
        casinoWatcher: {
            type: Number,
            required: false
        },
        casinoWatcherData: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            interval: 30,
            tags: [],
            lastPolled: (Date.now()/1000)
        }
    },
    emits: [
        "setCasinoWatcher",
        "setCasinoWatcherData",
        "clearCasinoWatcher",
        "clearCasinoWatcherData",
        "updateCasinoWatcher"
    ],
    methods: {
        cacheInterval(e) {
            localStorage.setItem('casinoWatcherInterval', e.target.value);
        },
        handleChangeTag(tags) {
            this.tags = tags;
            localStorage.setItem('casinoWatcherTags', tags);
        },
        validateTornUserID(value) {
            const regex = new RegExp(/^[0-9]*$/);
            return regex.test(value);
        },
        async startCasinoWatcher(e) {
            e.preventDefault();

            console.log("Setting up casino watcher!");
            console.log(`User IDs: ${this.tags}`);
            console.log(`Poll interval: ${this.interval}`);

            let users = [];
            let userids = this.tags.toString().split(',');
            let interval = Math.max(this.interval, 5) * 1000;

            // First we fetch the usernames
            userids.forEach( userid => {
                fetch(`https://api.torn.com/user/${userid}?selections=basic&key=${this.user.apiKey}`).then((response) => {
                    response.json().then((data) => {
                        users.push({id: userid, name: data.name, status: data.status.state, refills: 0, refilled: false});

                        let intervalId = setInterval(this.pollCasinoWatcher, interval, users);
                        let casinoWatcherData = {
                            users: users,
                            interval: interval,
                            intervalId: intervalId,
                        }

                        this.lastPolled = (Date.now()/1000);

                        this.$emit('setCasinoWatcher', intervalId);
                        this.$emit('setCasinoWatcherData', casinoWatcherData);

                        this.updateLastPolledCounter();
                    })
                });
            });

        },
        pollCasinoWatcher(users) {
            users.forEach(user => {
                console.log(`Polling personalstats for ${user.name} [${user.id}]...`);
                fetch(`https://api.torn.com/user/${user.id}?selections=personalstats&key=${this.user.apiKey}`).then((response) => {
                    response.json().then((data) => {
                        if (user.refills !== data.personalstats.tokenrefills && user.refills !== 0) {
                            // TRIGGER ALARM
                            user.refilled = true;
                        }
                        user.refills = data.personalstats.tokenrefills;
                        this.lastPolled = Date.now()/1000;
                        this.$emit('updateCasinoWatcher', users);
                    })
                })
            });
        },
        stopCasinoWatcher(e) {
            e.preventDefault();
            console.log("Stopping casino watcher");
            clearInterval(this.casinoWatcher);
            this.$emit('clearCasinoWatcher');
        },
        updateLastPolledCounter() {
            setInterval(() => {
                let pollCounter = document.getElementById('pollCounter');
                if(pollCounter) {
                    pollCounter.innerHTML = Math.round((Date.now() / 1000) - this.lastPolled);
                }
            },1000)
        }
    },
    mounted() {

        // Pre-populate torn user ids with cached data
        if (localStorage.getItem('casinoWatcherTags') != null) {
            let tagsCached = localStorage.getItem('casinoWatcherTags').split(',');
            this.handleChangeTag(tagsCached);
        }

        // Pre-populate interval slider if it's been adjusted before
        if (localStorage.getItem('casinoWatcherInterval') != null) {
            this.interval = localStorage.getItem('casinoWatcherInterval');
        }
    }
}
</script>

<template>

    <h1><i class="fa-brands fa-watchman-monitoring"></i> Casino Watcher</h1>

    <article id="sectionCasinoWatcherActive" v-if="casinoWatcher">
        <h2 class="success centered">Surveillance is active!</h2>
        <h3 class="centered">checked <span id="pollCounter">{{ Math.round((Date.now()/1000) - lastPolled) }}</span>s ago</h3><br>
        <table>
            <thead>
                <tr><th>User</th><th>Status</th><th>Casino token refills</th><th>Refilled now?</th><th>Attack</th></tr>
            </thead>
            <tbody>
                <tr v-for="user in casinoWatcherData.users" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td :class="user.status == 'Okay' ? 'success' : 'danger'">{{ user.status }}</td>
                    <td>{{ user.refills }}</td>
                    <td>{{ user.refilled ? 'Yes, attack!' : 'Nope, keep waiting...' }}</td>
                    <td>
                        <a :href="'https://www.torn.com/loader.php?sid=attack&user2ID=' + user.id" target="blank">
                            <i class="fa-solid fa-gun fa-2xl" :class="user.refilled ? 'danger fa-beat' : ''"></i>
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>


        <br><br>

        <form @submit="stopCasinoWatcher">
            <button type="submit" id="btnSubmitStopCasinoWatcher" class="secondary">Stop surveillance</button>
        </form>

        <br>
        <div style="font-size:0.8rem; color:#999;">Debugging:<br>
            tags: {{ tags.toString().split(',') }}<br>
            casinoWatcher: {{ casinoWatcher }}<br>
            interval: {{ interval }}<br>
        </div>


    </article>

    <article id="sectionCasinoWatcher" v-else>

        <p><small>
            The Casino Watcher will notify you when a user has requested a casino token refill.<br>
            This MAY indicate the user has lots of money on hand... you figure out the rest :)<br><br>

            Keep in mind that this tool may potentially send lots of requests to Torn API, so your API key may be rate-limited.<br>
            Use the indicator in the bottom and try to stay way below 50 requests pr minute to be on the safe side.<br><br>
            - Enter the user ID of those you wish to track<br>
            - Adjust the slider to choose a polling interval in seconds
        </small></p>

        <form @submit="startCasinoWatcher">

            <vue3-tags-input
                    :tags="tags"
                    placeholder="Torn User ID..."
                    @on-tags-changed="handleChangeTag"
                    :validate="validateTornUserID"
                    :add-tag-on-keys="[13, 188, 32, 9]"
            ></vue3-tags-input><br>

            <input type="range" id="inputCasinoWatcherInterval" min="5" max="60" step="5" v-model="interval" @change="cacheInterval"><br>

            <button type="submit" id="btnSubmitStartCasinoWatcher">Start surveillance</button>
        </form>

        <span class="centered">
            <p :class="Math.round((60/interval)*tags.length) > 75 ? 'danger' : Math.round((60/interval)*tags.length) > 45 ? 'warning' : 'success'">
                The Casino Watcher will trigger <b>{{ Math.round((60/interval)*tags.length) }}</b> API requests every minute<br>
                <small>{{ tags.length }} requests every {{ interval }} second</small>
            </p>
        </span>

    </article>


</template>

<style scoped>
h2 {
    margin:0;
    padding:0;
}
svg.danger {
    color:darkorange;
}
svg.danger:hover {
    color:orangered;
}
</style>
