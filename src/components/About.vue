<script>

export default {
    name: 'About',
    props: {
    },
    data() {
        return {

        }
    },
    methods: {
    },
    mounted() {
    }
}
</script>

<template>

    <h1>About</h1>
    <p>
        Torn Portal aims to offer a wide array of useful tools for you to enrich your Torn City career.<br>
        Made by <a href="https://www.torn.com/profiles.php?XID=2596327" target="_blank">Kvassh [2596327]</a>.
    </p>
    <p>
        <small>Inspired by other Torn projects such as TornTools, TornStats, Doctorn, YATA, torn.report ++</small>
    </p>

    <h2>Development</h2>
    <p>
        If you'd like to contribute to the project, feel free to submit a pull request on GitHub.<br>
        The app itself is a very simple vue3 app, you can check out the repo here:<br>
        <a href="https://github.com/kek91/torn-portal" target="_blank">https://github.com/kek91/torn-portal</a>
    </p>


    <h2>Changelog</h2>
    <ul>
        <li><b>0.2.1</b><br>
            - Money log can fetch logs for Today, Last 7 days or Last 30 days
        </li>
        <li><b>0.2.0</b><br>
            - Implemented the Money feature<br>
            - Misc layout adjustments
        </li>
        <li><b>0.1.0</b><br>
            - Initial release<br>
            - Automatic build & deploy to netlify
        </li>
    </ul>
    <p>
        Versioning explanation <small>(Major.Minor.Patch)</small><br>
        Major: New major overhauls or breaking features<br>
        Minor: New features, adjustments or bug fixes<br>
        Patch: Very minor bugfixes or stuff like typos etc
    </p>
    <p>
        Note: Torn Portal is still in beta and will therefore remain at major version 0 until deemed production ready.
    </p>




</template>

<style scoped>

</style>