<script>
import User from "../App.vue"

export default {
    name: 'Dashboard',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    methods: {
        async verifyKey(e) {
            e.preventDefault();
        }
    }
}
</script>

<template>

    <div>

        <h1>Hi {{ user.name }}</h1>
        <p>---</p>

    </div>

</template>

<style scoped>

</style>