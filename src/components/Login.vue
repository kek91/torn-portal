<script>
export default {
    name: 'Login',
    emits: [
        "setUser"
    ],
    methods: {
        async verifyKey(e) {
            e.preventDefault();

            let btnSubmitApiKey = document.getElementById('btnSubmitApiKey');
            btnSubmitApiKey.setAttribute('aria-busy', 'true');

            let inputApiKey = document.getElementById('inputApiKey').value;

            try {
                const response = await fetch(`https://api.torn.com/user/?selections=basic&key=${inputApiKey}`);
                const data = await response.json();

                if(!response.ok || data.hasOwnProperty('error')) {
                    if (data.hasOwnProperty('error')) {
                        throw `API Error: ${data.error.error}`;
                    }
                    throw `API Error: Unknown`;
                }

                const user = {id: data.player_id, name: data.name, apiKey: inputApiKey};
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

        }
    }
}


</script>

<template>

    <article>

        <h1>Login</h1>

        <p>Please enter your Torn API key</p>

        <form @submit="verifyKey">
            <input type="text" id="inputApiKey" placeholder="API key..." class="form-control">
            <button type="submit" id="btnSubmitApiKey">Login</button>
        </form>
        <a href="https://www.torn.com/preferences.php#tab=api?&step=addNewKey&title=Torn%20Portal&type=4" target="blank" role="button" class="outline">Create API key</a>


    </article>

    <h2>FAQ</h2>


    <details>
            <summary>Don't have an API key?</summary>
            <p>
                Click on the "Create API key" button which will take you to Torn settings and auto-generate the API key.<br>
                You can also do it manually by going to <a href="https://www.torn.com/preferences.php#tab=api" target="_blank">Account Preferences -> API</a> and click on "+ Create New Key".<br>
                Give it a name, i.e. Torn Portal, and select what permissions you want to give. Some features might not work if you don't allow enough permissions, more info will come later regarding that.<br>
                Lastly, copy the generated token and use that to login on this site.</p>
                <img src="data:image/png;base64,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">
        </details>
        <details>
            <summary>Why do you require Full permissions?</summary>
            <p>I don't, but some features might not work without enough permissions... start out with Basic permissions and see if it works. If not, just create a new API key with more permissions.</p>
        </details>
        <details>
            <summary>Are you exploiting my API key to mug me?</summary>
            <p><span class="strikethrough">No, but thanks for the idea :D</span><br><br>
                The API keys are never sent anywhere. You can open the browser inspector (F12) and see for yourself that no outgoing requests are sent when logging in (except the api.torn.com request ofcourse)</p>
        </details>
        <details>
            <summary>I still don't trust you!</summary>
            <p>Take a look in the code then, it's open source! <a href="https://github.com/kek91/torn-portal" target="_blank">https://github.com/kek91/torn-portal</a></p>
        </details>


</template>

<style scoped>
article {
    max-width:500px;
    margin:0 auto;
    text-align:center;
}
details p {
    font-size:0.8rem;
}
.strikethrough {
    text-decoration: line-through;
}
</style>
