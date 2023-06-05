<template>
    <div class="scoreboard">
        <h2>Scoreboard</h2>
        <table>
            <thead>
                <tr>
                    <th class="rank-change"></th>
                    <th>Rang</th>
                    <th>Name</th>
                    <th>Punkte</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="{ rank, key, value } in sortedScoresWithRank" :key="key" @mouseover="showPercentage[key] = true"
                    @mouseout="showPercentage[key] = false">
                    <td>
                        <span class="rank-change" :class="{
                                'better': rankChanges[key] < 0,
                                'worse': rankChanges[key] > 0,
                            }">
                            {{ rankChanges[key] < 0 ? '▴' : rankChanges[key] > 0 ? '▾' : '' }}
                        </span>
                    </td>
                    <td>{{ rank }}</td>
                    <td>{{ students[key].firstName }}</td>
                    <td>{{ value }}</td>
                    <td>
                        <span class="score-change" v-if="scoreChanges[key] !== 0">
                            {{ scoreChanges[key] > 0 ? '+' : '' }}{{ scoreChanges[key] }}
                        </span>
                    </td>
                    <td class="score-change pointer" v-if="studentStatsChanges[key].attemptsChange !== 0">
                        <div v-if="!showPercentage[key]">
                            <span>{{ studentStatsChanges[key].correctChange }}</span>/<span>{{
                                studentStatsChanges[key].attemptsChange }}</span>
                        </div>
                        <span v-if="showPercentage[key]">{{ studentStatsChanges[key].percentageChange.toFixed(0) }}%</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <button v-if="allExpressionsUsed" @click="saveScoresToLocalStorage">Save</button>
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
        },
        initialStudentStats: {
            type: Object,
            required: true
        },
        studentStats: {
            type: Object,
            required: true
        },
    },
    data() {
        return {
            initialRankings: {},
            showPercentage: {},
        };
    },
    mounted() {
        this.saveInitialRankings();
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
                rankedScores.push({ rank, key, value });
                prevScore = value;
                index++;
            }
            return rankedScores;
        },
        rankChanges() {
            const changes = {};
            for (let { rank, key } of this.sortedScoresWithRank) {
                if (this.initialRankings[key] !== undefined) {
                    changes[key] = rank - this.initialRankings[key];
                }
            }
            return changes;
        },
        studentStatsChanges() {
            const changes = {};
            for (let key in this.studentStats) {
                const initialStats = this.initialStudentStats[key] || { attempts: 0, correct: 0 };
                const currentStats = this.studentStats[key];
                const attemptsChange = currentStats.attempts - initialStats.attempts;
                const correctChange = currentStats.correct - initialStats.correct;
                const percentageChange = attemptsChange > 0 ? (correctChange / attemptsChange) * 100 : 0;
                changes[key] = {
                    attemptsChange,
                    correctChange,
                    percentageChange,
                };
            }
            return changes;
        }
    },
    methods: {
        saveInitialRankings() {
            for (let { rank, key } of this.sortedScoresWithRank) {
                if (this.initialRankings[key] === undefined) {
                    this.initialRankings[key] = rank;
                }
            }
        },
        saveScoresToLocalStorage() {
            localStorage.setItem(this.localStorageKey + "_ranking_" + this.courseKey, JSON.stringify(this.sortedScores));
            localStorage.setItem(this.localStorageKey + "_studentStats_" + this.courseKey, JSON.stringify(this.studentStats));
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
    font-size: 1em;
}

table {
    border-collapse: collapse;

}

thead {
    background-color: #ffffff40;
    display: none;
}

table tbody tr:hover {
    background-color: rgba(255, 255, 255, .5);
}

th,
td {
    padding: 0 3px;
    border: none;
    text-align: left;
}

.rank-change {
    width: 10px;
    padding: 0;
}

.rank-change.better {
    color: green;
}

.rank-change.worse {
    color: red;
}

.score-change {
    font-size: 0.7em;
}

.pointer {
    cursor: pointer;
}
</style>