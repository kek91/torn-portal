<script>
import HelloWorld from './components/HelloWorld.vue'
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";
import { useNotification } from "@kyvg/vue3-notification";
const { notify }  = useNotification()
import { version } from '../package.json'

export class User {
    constructor(obj) {
        obj = obj != null ? obj : {}
        this.id = obj.id != null ? obj.id : ''
        this.name = obj.name != null ? obj.name : ''
        this.apiKey = obj.apiKey != null ? obj.apiKey : ''
    }
}

export default {
    name: 'App',
    components: {
        HelloWorld,
        Login,
        Dashboard
    },
    data() {
        return {
            apikey: "2596327",
            loggedIn: false,
            user: null,
            appVersion: version
        }
    },
    methods: {
        setUser(user) {
            console.log(`Saving userdata to localStorage (${JSON.stringify(user)})`);
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
        }
    },
    mounted() {
        this.$notify({
            title: "Torn Market",
            text: `v${version}`,
            type: 'info'
        });
    }
}
</script>

<template>
    <header>
        <h1>Torn Portal <small>v{{ appVersion }}</small></h1>
    </header>
    <main>
        <Login
                v-if="user == null"
                @setUser="setUser"
        ></Login>
        <Dashboard
                v-else
                :user="user"
        ></Dashboard>
    </main>
    <footer>
        <p>The API key is not stored anywhere, everything happens in your browser.</p>
        <p>Questions? Contact <a href="https://www.torn.com/profiles.php?XID=2596327" target="_blank">Kvassh [2596327]</a> ingame.</p>
    </footer>
    <Notifications></Notifications>
</template>

<style>


    header {
        background: #333;
    }
    header h1 {
        color :#fff;
        font-weight:100;
        font-size:1.2rem;
        padding:10px;
        margin:0;
    }

    main {
        padding:20px;
    }

    footer {
        background: #333;
        color: #eee;
        padding: 50px 0px;
        text-align:center;
        line-height:2px;
    }
    footer p {
        font-size:0.8rem;
        font-weight:200;
        color:#eee;
    }

    h1 {
        font-weight:400;
        margin:10px 0px;
    }

</style>
