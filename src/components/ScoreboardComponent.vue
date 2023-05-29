<template>
    <div class="scoreboard">
        <h2>Scoreboard</h2>
        <div v-for="{ rank, key, value } in sortedScoresWithRank" :key="key">
            {{ rank }}. {{ students[key].firstName }}: {{ value }}
            <span v-if="scoreChanges[key] !== 0">
                ({{ scoreChanges[key] > 0 ? '+' : '' }}{{ scoreChanges[key] }})
            </span>
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
        courseKey: {
            type: String,
            required: false
        }
    },
    computed: {
        sortedScores() {
            const sortedEntries = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
            return Object.fromEntries(sortedEntries);
        },
        scoreChanges() {
            let changes = {};
            for (let studId in this.scores) {
                changes[studId] = this.scores[studId] - this.initialScores[studId];
            }
            return changes;
        },
        sortedScoresWithRank() {
        const rankedScores = [];
        let rank = 1, index = 1;
        let prevScore = null;
        for (let [key, value] of Object.entries(this.sortedScores)) {
            if (prevScore != null && prevScore != value) {
                rank = index;
            }
            rankedScores.push({rank, key, value});
            prevScore = value;
            index++;
        }
        return rankedScores;
    },
    },
    methods: {
        saveFinalOverview() {
            localStorage.setItem(this.localStorageKey + "_ranking_" + this.courseKey, JSON.stringify(this.sortedScores));
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