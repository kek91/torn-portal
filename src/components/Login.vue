<script>
export default {
    name: 'Login',
    methods: {
        async verifyKey(e) {
            e.preventDefault();

            let btnSubmitApiKey = document.getElementById('btnSubmitApiKey');
            btnSubmitApiKey.setAttribute('aria-busy', 'true');

            let inputApiKey = document.getElementById('inputApiKey').value;

            setTimeout(async () => {

                try {
                    const response = await fetch(`https://api.torn.com/user/?selections=basic&key=${inputApiKey}`);
                    const userData = await response.json();

                    if (userData.hasOwnProperty('error')) {
                        throw `API Error: ${$data.error.error}`;
                    }

                    const user = {id: userData.player_id, name: userData.name, apiKey: inputApiKey};
                    this.$emit('setUser', user);

                    btnSubmitApiKey.setAttribute('aria-busy', 'false');
                } catch (e) {

                    console.error(`Authentication error: ${e}`);
                    this.$notify({
                        title: "Authentication error",
                        text: `${e}`,
                        type: "error"
                    });
                    btnSubmitApiKey.setAttribute('aria-busy', 'false');
                }

            }, 250);


        }
    }
}


</script>

<template>

    <article>

        <h1>Login</h1>

        <p>Please enter your Torn API key to proceed to the Torn Portal</p>

        <form @submit="verifyKey">
            <input type="text" id="inputApiKey" placeholder="API key..." class="form-control">
            <button type="submit" id="btnSubmitApiKey">Login</button>
        </form>

    </article>

</template>
