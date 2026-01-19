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

    <pre>

        0.3.0 - 2026-01-20:
        - Add new Retal feature on War page - shows potential retalliation targets based on incoming attacks within last 5 minutes
        - Change colors for BSP difficulty levels
        - Add local caching for BSP if remote server is outdated
        - Minor bugfixes and improvements

        0.2.19 - 2025-07-25:
        - Fixed minor bug for BSP because it didnt have space to fit 4 characters
        
        0.2.18 - 2025-07-01:
        - Fix async bug in Trades feature where trades were not shown correctly after refreshing data
        - Minor adjustments in changelog formatting

        0.2.16 - 2025-07-01:
        - Fix green background color on target row on War page when released out of hospital
        
        0.2.15 - 2025-06-30:
        - Fix sorting correctly for hospitalized people on War page
        - Minor UI adjustment
        
        0.2.14 - 2025-06-15:
        - Fix bug in date comparison for locally cached battlestat prediction

        0.2.13 - 2025-06-15:
        - Fetch battlestat predictions with different source

        0.2.12 - 2025-04-16:
        - Implement trades feature
        - Added debug info on dashboard
        - Misc bugfixes/improvements
        0.2.11:
        - Several bugfixes and technical improvements
        - Battlestat prediction works in both dark + light mode
        - Add button to toggle between light and dark mode

        0.2.10 - 2025-04-14:
        - Chain timer on War page fully implemented
        - Minor bugfixes and technical improvements
        - Upgraded all dependencies
        - Add battlestat prediction on War page

        0.2.9 - 2025-04-13:
        - Some UI adjustment for nav menu
        - API requests go through custom backend for incorporating BattleStatPredictor later on
        - Avoid redundant network request when loading Dashboard
        - WIP: Chain timer on War page

        0.2.8:
        - Fix responsive tables for several tools
        - Rename "Hospital Targets" to "War"
        - Always fetch new data for Dashboard + Job Points features, and fallback to cached data if the request fails
        - War feature completed
        - Fix bug in attack icon link in War feature
        - Misc minor bugfixes

        0.2.7:
        - Job Finder complete!
        - Minor UI adjustments
        - Show days in faction + current job on Dashboard
        - [WIP] Made some progress on HospitalTargets

        0.2.6:
        - [WIP] Began working on "Job Finder" feature...
        - Transactions table is responsive and shows horizontal scroller if necessary
        - Minor UI adjustment navigation

        0.2.5:
        - Implemented "Job Points" feature
        - Renamed "Money Log" to "Transactions"
        - Added secondary navigation for all the tools
        - [WIP] Began working on "Hospital Targets" feature...

        0.2.4:
        - Implemented the Money feature
        - Implemented the Casino Watcher feature
        - Adapted error handler for authentication because Torn API returns 200 for incorrect API key instead of 401 Unauthorized which would be more fitting
        - Fix potential null point exception when fetching data
        - Misc layout adjustments
        - Add temporary favicon

        0.1.0:
        - Initial release
        - Automatic build & deploy to netlify
    </pre>

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