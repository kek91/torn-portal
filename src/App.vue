<script>
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import Transactions from "@/components/Transactions.vue";
import Trades from "@/components/Trades.vue";
import About from "@/components/About.vue";
import CasinoWatcher from "@/components/CasinoWatcher.vue";
import Error404 from "@/components/Error404.vue";
import JobPoints from "@/components/JobPoints.vue";
import JobFinder from "@/components/JobFinder.vue";
import War from "@/components/War.vue";
import {useNotification} from "@kyvg/vue3-notification";
import {version} from '../package.json'

const {notify} = useNotification()

export default {
    name: 'App',
    components: {
        Login,
        Dashboard,
        Transactions,
        Trades,
        About,
        CasinoWatcher,
        Error404,
        JobPoints,
        JobFinder,
        War,
    },
    data() {
        return {
            user: null,
            appVersion: version,
            router: 'dashboard',
            casinoWatcher: null,
            casinoWatcherData: null
        }
    },
    methods: {
        setUser(user) {
            console.log(`Saving userdata to localStorage (${JSON.stringify(user)})`);
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            this.setRouter('dashboard');
        },
        setRouter(page) {
            console.log('this.router = ' + page);
            this.router = page;
        },
        setCasinoWatcher(intervalid) {
            this.casinoWatcher = intervalid;
        },
        setCasinoWatcherData(data) {
            this.casinoWatcherData = data;
        },
        clearCasinoWatcher() {
            this.casinoWatcher = null;
        },
        clearCasinoWatcherData() {
            this.casinoWatcherData = null;
        },
        updateCasinoWatcher(users) {
            this.casinoWatcherData.users = users;
        },
        logout() {
            let confirmation = confirm("Are you sure you wish to log out?");
            if (confirmation) {
                this.user = null;
                localStorage.removeItem('user');
                localStorage.removeItem('profile');
                localStorage.removeItem('log');
                localStorage.removeItem('jobPoints');
            }
        }
    },
    mounted() {

        // Use cached data if it exists
        if (localStorage.getItem('user') != null) {
            this.user = JSON.parse(localStorage.getItem('user'));
            console.log(`Loaded data from cache. Welcome back ${this.user.name} :)`);
        }

        // use router if url entered manually
        if (window.location.hash) {
            this.setRouter(window.location.hash.replace('#', ''));
        }

        // this.user = null;
    }
}
</script>

<template>
    <header>

        <nav id="primaryNav">
            <ul>
                <li><a href="#dashboard" @click="setRouter('dashboard')"><b>Torn&nbsp;Portal</b></a></li>
            </ul>
            <ul v-if="user != null">
                <li><a href="#about" @click="setRouter('about')">About</a></li>
                <li><a href="#logout" @click="logout">Logout</a></li>
            </ul>
        </nav>

        <nav id="secondaryNav" v-if="user != null">
            <ul>
                <li data-tooltip="Dashboard" data-placement="bottom">
                    <a href="#dashboard" @click="setRouter('dashboard')">
                        <i class="fa-solid fa-house"></i>
                    </a>
                </li>
                <li data-tooltip="Transactions" data-placement="bottom">
                    <a href="#transactions" @click="setRouter('transactions')">
                        <i class="fa-solid fa-money-bill"></i>
                    </a>
                </li>
                <li data-tooltip="Trade statistics" data-placement="bottom">
                    <a href="#trades" @click="setRouter('trades')">
                        <i class="fa-solid fa-chart-simple"></i>
                    </a>
                </li>
                <li data-tooltip="Job Points" data-placement="bottom">
                    <a href="#jobpoints" @click="setRouter('jobpoints')">
                        <i class="fa-solid fa-suitcase"></i>
                    </a>
                </li>
                <li data-tooltip="Job Finder" data-placement="bottom">
                    <a href="#jobfinder" @click="setRouter('jobfinder')">
                        <i class="fa-solid fa-magnifying-glass-dollar"></i>
                    </a>
                </li>
                <li :data-tooltip="casinoWatcher != null ? 'Casino Watcher (ACTIVE)' : 'Casino Watcher'"
                    data-placement="bottom">
                    <a href="#casinowatcher" @click="setRouter('casinowatcher')">
                        <i class="fa-brands fa-watchman-monitoring" :class="casinoWatcher != null ? 'danger' : ''"></i>
                    </a>
                </li>
                <li data-tooltip="War" data-placement="bottom">
                    <a href="#war" @click="setRouter('war')">
                        <i class="fa-solid fa-skull-crossbones"></i>
                    </a>
                </li>
            </ul>
        </nav>

    </header>
    <main>
        <Login
                v-if="user == null"
                @setUser="setUser"
        ></Login>
        <div v-else>
            <Dashboard
                    v-if="router === 'dashboard'"
                    :user="user"
                    :casinoWatcher="casinoWatcher"
                    @setRouter="setRouter"
            ></Dashboard>
            <Transactions
                    v-else-if="router === 'transactions'"
                    :user="user"
            ></Transactions>
            <Trades
                    v-else-if="router === 'trades'"
                    :user="user"
            ></Trades>
            <About
                    v-else-if="router === 'about'"
                    :app-version="appVersion"
            ></About>
            <CasinoWatcher
                    v-else-if="router === 'casinowatcher'"
                    :user="user"
                    :casinoWatcher="casinoWatcher"
                    :casinoWatcherData="casinoWatcherData"
                    @setCasinoWatcher="setCasinoWatcher"
                    @setCasinoWatcherData="setCasinoWatcherData"
                    @clearCasinoWatcher="clearCasinoWatcher"
                    @clearCasinoWatcherData="clearCasinoWatcherData"
                    @updateCasinoWatcher="updateCasinoWatcher"
            ></CasinoWatcher>
            <JobPoints
                    v-else-if="router === 'jobpoints'"
                    :user="user"
            ></JobPoints>
            <JobFinder
                    v-else-if="router === 'jobfinder'"
                    :user="user"
            ></JobFinder>
            <War
                    v-else-if="router === 'war'"
                    :user="user"
            ></War>
            <Error404 v-else></Error404>
        </div>

    </main>
    <footer>
        <p>The API key is not stored or sent anywhere, it's just cached locally in your browser storage.</p>
        <p>Click the Logout button if you wish to clear your cache.</p>
        <p>Questions? Contact <a href="https://www.torn.com/profiles.php?XID=2596327" target="_blank">Kvassh
            [2596327]</a> ingame.</p>
    </footer>
    <Notifications position="center top"></Notifications>
</template>

<style>

header {
    background: #333;
    position: sticky;
    top: 0;
    z-index: 999;
    max-height: 100px;
}

header nav#primaryNav {
    margin: 0px 10px;
    height: 30px;
    /*margin-bottom:15px;*/
}

header nav#secondaryNav {
    margin: 0px 10px;
    padding-top: 5px;
    height: 45px;
    border-top: 1px solid #1b588c;
}

header nav ul li a {
    font-weight: 300;
    color: #fff;
    font-size: 0.8rem;
}

header nav#secondaryNav ul li a {
    font-size: 1.2rem;
    /*border:1px solid red;*/
    /*padding:0;*/
}

header nav ul li a:hover {
    color: #999;
}


main {
    padding: 20px;
}

footer {
    background: #333;
    color: #eee;
    padding: 50px 0px;
    text-align: center;
    line-height: 2px;
}

footer p {
    font-size: 0.8rem;
    font-weight: 200;
    color: #eee;
}

h1 {
    font-weight: 400;
    margin: 10px 0px;
}

h2 {
    font-weight: 400;
    margin: 5px 0px;
}

h3 {
    font-weight: 400;
    margin: 2px 0px;
    padding: 0px;
}

.success {
    color: green;
}

.danger {
    color: indianred;
}

.warning {
    color: darkorange;
}

.info {
    color: dodgerblue;
}

.centered, .center {
    text-align: center;
}

.left {
    text-align: left;
}

.right {
    text-align: right;
}

:root {
    --primary: #1e88e5 !important;
    --primary-focus: rgba(0, 0, 0, 0) !important;
    --primary-hover: #4e9ce0 !important;
}

hr.blue {
    border: 1px solid #1e88e5;
}

[data-tooltip]:not(a,button,input) {
    border: 0;
}

</style>
