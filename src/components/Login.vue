<script>
export default {
    name: 'Login',
    data() {
        return {
            foo: "bar"
        }
    },
    // props: {
    //     apiKey: {
    //         type: String,
    //         required: false
    //     }
    // },
    methods: {
        async verifyKey(e) {
            e.preventDefault();

            let inputApiKey = document.getElementById('inputApiKey').value;
            console.log(inputApiKey);

            const response = await fetch(`https://api.torn.com/user/?selections=basic&key=${inputApiKey}`);
            const userData = await response.json();

            if(userData.hasOwnProperty('error')) {
                console.error(`Authentication error: ${userData.error.error}`);
                this.$notify({
                    title: "Authentication error",
                    text: `Details: ${userData.error.error}`,
                    type: "error"
                });
            }
            else {
                this.$emit('setUser', userData);
                this.$notify({
                    title: "Authentication successful",
                    text: `Hi ${userData.name}!`,
                    type: "success"
                });
            }

            console.log(userData);

            console.log("Verifying...");
            const user = {
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
            };
            setTimeout(() => {
                document.getElementById('loginresult').innerHTML = 'Verifying API token...';
                setTimeout(() => {
                    document.getElementById('loginresult').innerHTML = 'Result:';
                    setTimeout(() => {
                        document.getElementById('loginresult').innerHTML = `Result:<br><br>${JSON.parse(JSON.stringify(user))}`;

                        this.$emit('setUser', user);
                    }, 500)
                }, 500)
            }, 10)
        }
    }
}


</script>

<template>
    <div>

        <h1>Login</h1>
        <p>Please enter your Torn API key to proceed to Torn Market</p>

        <form @submit="verifyKey">
            <input type="text" id="inputApiKey" placeholder="API key..." class="form-control">
            <input type="submit" class="btn btn-primary" value="Login">
        </form>

        <div id="loginresult"></div>
    </div>

</template>

<style scoped>
h1 {
    margin:0;
}

</style>