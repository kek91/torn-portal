<script>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import Login from "@/components/Login.vue";
import { useNotification } from "@kyvg/vue3-notification";
const { notify }  = useNotification()
import { version } from '../package.json'

export default {
    name: 'App',
    components: {
        HelloWorld,
        TheWelcome,
        Login,
    },
    data() {
        return {
            apikey: "2596327",
            loggedIn: false,
            user: {},
            userExample: {
                "level": 80,
                "gender": "Female",
                "player_id": 2596327,
                "name": "Kvassh",
                "status": {
                    "description": "Okay",
                    "details": "",
                    "state": "Okay",
                    "color": "green",
                    "until": 0,
                },
            },
            userErr: {"error": {"code": 2, "error": "Incorrect key",}}
        }
    },
    methods: {
        setUser(user) {
            console.log(`Setting userdata to ${user}`);
        },
        showNotification(color, data) {
            document.getElementById('notifications').innerHTML = `<div style="color:${color};">${data}</div>`;
            setTimeout(() => {
                document.getElementById('notifications').innerHTML = ``;
            }, 2000);
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
        <h1>Torn Portal</h1>
    </header>
<!--    <Notifications></Notifications>-->
    <notifications></notifications>
    <main>
        <div id="notifications"></div>
        <Login
                v-if="!loggedIn"
        ></Login>
        <HelloWorld
                v-else
                msg="test">
        </HelloWorld>
    </main>
    <footer>
        <p>The API key is not stored anywhere, everything happens in your browser.</p>
        <p>Questions? Contact <a href="https://www.torn.com/profiles.php?XID=2596327">Kvassh [2596327]</a> ingame.</p>
    </footer>
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
    }

    main {
        padding:20px;
    }

    footer {
        background: #333;
        color: #eee;
        padding: 30px 0px;
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
    }

</style>
