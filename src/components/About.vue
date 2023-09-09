<script>

export default {
    name: 'About',
    props: {
        appVersion: {
            type: String,
            required: true
        }
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

    <h1><i class="fa-solid fa-circle-info"></i> Torn Portal <small>v{{ appVersion }}</small></h1>
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
        <li><b>Beta</b><br>
            - Fix bug in attack icon link in War feature<br>
            - Misc minor bugfixes<br>
            - WIP: Trades feature for showing trading history<br>
        </li>
        <li><b>0.2.8</b><br>
            - Fix responsive tables for several tools<br>
            - Rename "Hospital Targets" to "War"<br>
            - Always fetch new data for Dashboard + Job Points features, and fallback to cached data if the request fails<br>
            - War feature completed<br>
        </li>
        <li><b>0.2.7</b><br>
            - Job Finder complete!<br>
            - Minor UI adjustments<br>
            - Show days in faction + current job on Dashboard<br>
            - [WIP] Made some progress on HospitalTargets<br>
        </li>
        <li><b>0.2.6</b><br>
            - [WIP] Began working on "Job Finder" feature...<br>
            - Transactions table is responsive and shows horizontal scroller if necessary<br>
            - Minor UI adjustment navigation<br>
        </li>
        <li><b>0.2.5</b><br>
        - Implemented "Job Points" feature<br>
        - Renamed "Money Log" to "Transactions"<br>
        - Added secondary navigation for all the tools<br>
        - [WIP] Began working on "Hospital Targets" feature...<br>
        </li>
        <li><b>0.2.4</b><br>
            - Implemented the Money feature<br>
            - Implemented the Casino Watcher feature<br>
            - Adapted error handler for authentication because Torn API returns 200 for incorrect API key instead of 401 Unauthorized which would be more fitting<br>
            - Fix potential null point exception when fetching data<br>
            - Misc layout adjustments<br>
            - Add temporary favicon
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