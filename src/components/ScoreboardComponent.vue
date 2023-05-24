<template>
    <div class="scoreboard">
        <h2>Scoreboard</h2>
        <div v-for="(item, index) in sortedScores" :key="index">
            {{ index + 1 }}. {{ item.name }}: {{ item.count }}
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
    data() {
        return {
            initialscores: {}
        };
    },
    computed: {
        sortedScores() {
            return Object.entries(this.scores)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);
        },

    },

    mounted() {
        const existingRanking = JSON.parse(localStorage.getItem(this.localStorageKey));
        if (existingRanking) {
            this.initialScores = { ...existingRanking };
            console.log("Ranking from localStorage successfully loaded.");
        } else {
            console.log("No ranking found.");

        }
    },
    methods: {
        saveFinalOverview() {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.localScores));
        }
    }
};
</script>
  
<style scoped>
.scoreboard {
    font-family: "Lucida Handwriting", serif;
}

h2 {
    font-family: "Algerian", serif;
}

.score-change {
    font-size: 12px;
}
</style>