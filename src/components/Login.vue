<script>
export default {
    name: 'Login',
    methods: {
        async verifyKey(e) {
            e.preventDefault();

            let inputApiKey = document.getElementById('inputApiKey').value;

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
                const user = {id: userData.player_id, name: userData.name, apiKey: inputApiKey};
                this.$emit('setUser', user);
                this.$notify({
                    title: "Authentication successful",
                    text: `Hi ${user.name}!`,
                    type: "success"
                });
            }
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

    </div>

</template>
