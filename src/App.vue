<script>
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import Money from "@/components/Money.vue";
import About from "@/components/About.vue";
import {useNotification} from "@kyvg/vue3-notification";
import {version} from '../package.json'

const {notify} = useNotification()

export default {
    name: 'App',
    components: {
        Login,
        Dashboard,
        Money,
        About
    },
    data() {
        return {
            user: null,
            appVersion: version,
            router: 'dashboard'
        }
    },
    methods: {
        setUser(user) {
            console.log(`Saving userdata to localStorage (${JSON.stringify(user)})`);
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
        },
        setRouter(page) {
            this.router = page;
        },
        logout() {
            let confirmation = confirm("Are you sure you wish to log out?");
            if (confirmation) {
                this.user = null;
                localStorage.removeItem('user');
                localStorage.removeItem('profile');
            }
        }
    },
    mounted() {

        // Use cached data if it exists
        if (localStorage.getItem('user') != null) {
            this.user = JSON.parse(localStorage.getItem('user'));
            console.log(`Loaded data from cache. Welcome back ${this.user.name} :)`);
        }

        // this.user = null;
    }
}
</script>

<template>
    <header>
        <nav>
            <ul>
                <li><a href="#dashboard" @click="setRouter('dashboard')"><b>Torn Portal</b></a> <a href="#about" @click="setRouter('about')"><small>v{{ appVersion }}</small></a></li>
            </ul>
            <ul v-if="user != null">
                <li><a href="#dashboard" @click="setRouter('dashboard')">Dashboard</a></li>
                <li role="list" data-theme="dark"><a href="#" aria-haspopup="dropdownTools">Tools</a>
                    <ul role="dropdownTools">
                        <li><a href="#money" @click="setRouter('money')">Money</a></li>
                        <li><a href="#" disabled="true">TBA</a></li>
                        <li><a href="#" disabled="true">TBA</a></li>
                        <li><a href="#" disabled="true">TBA</a></li>
                        <li><a href="#" disabled="true">TBA</a></li>
                    </ul>
                </li>
                <li><a href="#about" @click="setRouter('about')">About</a></li>
                <li><a href="#logout" @click="logout">Logout</a></li>
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
                    @setRouter="setRouter"
            ></Dashboard>
            <Money
                    v-else-if="router === 'money'"
                    :user="user"
            ></Money>
            <About
                    v-else-if="router === 'about'"
                    :user="user"
            ></About>
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
    position:sticky;
    top:0;
    z-index:999;
    max-height:50px;
}

header nav {
    margin:0px 10px;
    max-height: 50px;
}

header nav ul li a  {
    font-weight: 300;
    color:#fff;
}

header nav ul li a:hover {
    color:#999;
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
    font-weight:400;
    margin: 50px 0px 10px 0px;
}

.success {
    color:green;
}
.danger {
    color:indianred;
}
.centered {
    text-align:center;
}

:root {
    --primary: #1e88e5 !important;
    --primary-focus: rgba(0,0,0,0) !important;
    --primary-hover: #4e9ce0 !important;
}
</style>
