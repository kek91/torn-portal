<script>
import HelloWorld from './components/HelloWorld.vue'
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import Money from "@/components/Money.vue";
import {useNotification} from "@kyvg/vue3-notification";
import {version} from '../package.json'

const {notify} = useNotification()

export default {
    name: 'App',
    components: {
        HelloWorld,
        Login,
        Dashboard,
        Money
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
    }
}
</script>

<template>
    <header>
        <nav>
            <ul>
                <li><a href="#dashboard" @click="setRouter('dashboard')"><b>Torn Portal</b> <small>v{{ appVersion }}</small></a></li>
            </ul>
            <ul v-if="user == null">
                <li><a href="#login" @click="setRouter('login')">Login</a></li>
            </ul>
            <ul v-else>
                <li><a href="#dashboard" @click="setRouter('dashboard')">Dashboard</a></li>
                <li><a href="#money" @click="setRouter('money')">Money</a></li>
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
}

header h1 {
    color: #fff;
    font-weight: 100;
    font-size: 1.2rem;
    padding: 10px;
    margin: 0;
}

header nav {
    margin:0px 50px;
}

header nav ul li {
    font-weight: 100;
    color: #fff;
}

header nav ul li a {
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
</style>
