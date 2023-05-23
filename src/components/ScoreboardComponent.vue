<template>
    <div class="scoreboard">
        <h2>Scoreboard</h2>
        <div v-for="(count, name) in scores" :key="name">
            {{ name }}: {{ count }}
        </div>
        <button v-if="allExpressionsUsed" @click="saveFinalOverview">Save</button>
    </div>
</template>
  
<script>
export default {
    name: 'ScoreboardComponent',
    props: {
        scores: {
            type: Object,
            required: true
        },
        students: {
            type: Object,
            required: true
        },
        allExpressionsUsed: {
            type: Boolean,
            required: true
        },
        localStorageKey: {
            type: String,
            required: true
        },
    },
    computed: {

    },
    mounted() {
        const existingRanking = localStorage.getItem(this.localStorageKey);
        if (existingRanking) {
            Object.assign(this.scores, JSON.parse(existingRanking));
            console.log("Ranking from localStorage successfully loaded.");
            console.log(this.scores);
        } else {
            console.log("No ranking found.");
        }
    },
    methods: {
        saveFinalOverview() {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.scores));
        }
    }
};
</script>
  
<style scoped>
.scoreboard {
    font-family: "Lucida Handwriting", serif;
    grid-area: score;
}

h2 {
    font-family: "Algerian", serif;
}
</style>
  