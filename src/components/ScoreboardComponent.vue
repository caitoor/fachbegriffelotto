<template>
    <div class="scoreboard">
        <h2>Scoreboard</h2>
        <div v-for="(value, name, index) in sortedScores" :key="name">
            {{ index + 1 }}. {{ name }}: {{ value }} ({{ scoreChanges[name] >= 0 ? '+' : '' }}{{ scoreChanges[name] }})
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
        initialScores: {
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
        sortedScores() {
            const sortedEntries = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
            return Object.fromEntries(sortedEntries);
        },
        scoreChanges() {
        let changes = {};
        for (let name in this.scores) {
            changes[name] = this.scores[name] - this.initialScores[name];
        }
        return changes;
    }
    },
    methods: {
        saveFinalOverview() {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.sortedScores));
        }
    }
};
</script>
  
<style scoped>
.scoreboard {
    font-family: "Lucida Handwriting", serif;
    background-image: url('~@/assets/scroll.jpg');
    background-size: cover;
    padding: 50px 90px;
}

h2 {
    font-family: "Algerian", serif;
}

.score-change {
    font-size: 12px;
}
</style>