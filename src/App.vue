<template>
  <div id="wrapper">
    <header-component class="header-component" @fileSelected="onFileSelected" />
    <quiz-component v-if="started" class="quiz-component" :all-expressions-used="allExpressionsUsed" :started="started"
      :current-combination="currentCombination" :used-expressions-count="usedExpressions.length"
      :total-expressions="expressions.length" :current-expression="currentExpression" :countdown="countdown"
      @answerGiven="answerGiven" @countdownCompleted="handleCountdownCompleted" />
    <div id="hint" v-if="started">
      <button id="solution" @click="toggleSolution">Lösung</button>
      <p v-if="showSolution">{{ currentSolution }}</p>
    </div>
    <scoreboard-component class="scoreboard-component" v-if="started && students" :localStorageKey="localStorageKey"
      :scores="scores" :initial-scores="initialScores" :allExpressionsUsed="allExpressionsUsed" :students="students" />
    <weel-of-fortune class="weel-of-fortune" @selection="(msg) => { disableWeel = true; generateCombination(msg) }"
      :disabled="disableWeel" />
  </div>
</template>

<script>
import students from "@/data/students.json";
import HeaderComponent from './components/HeaderComponent.vue';
import QuizComponent from './components/QuizComponent';
import ScoreboardComponent from './components/ScoreboardComponent.vue';
import WeelOfFortune from "./components/WeelOfFortune.vue";
const localStorageKey = process.env.VUE_APP_LOCAL_STORAGE_KEY;
const playSounds = process.env.VUE_APP_PLAY_SOUNDS === 'true';
export default {
  data() {
    return {
      expressions: [],
      currentExpression: {},
      currentCombination: "",
      usedExpressions: [],
      allExpressionsUsed: false,
      started: false,
      showSolution: false,
      currentSolution: "",
      currentStudent: {},
      disableWeel: false,
      students: students,
      scores: {},
      countdown: 20,
      localStorageKey: localStorageKey,
      initialScores: {}
    };
  },
  computed: {
    totalExpressions() {
      return this.expressions.length;
    },
    usedExpressionsCount() {
      return this.usedExpressions.length;
    },
  },
  mounted() {
    const existingRankingData = localStorage.getItem(this.localStorageKey);
    if (existingRankingData) {
      const existingRanking = JSON.parse(existingRankingData);
      if (existingRanking) {
        this.initialScores = JSON.parse(JSON.stringify(existingRanking));
        this.scores = JSON.parse(JSON.stringify(existingRanking));
        console.log("Ranking from localStorage successfully loaded.");
      } else {
        console.log("No ranking found.");
        this.initializeScores();
      }
    } else {
      console.log("No data in localStorage.");
    }
  },
  methods: {
    onFileSelected(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          this.expressions = data;
          this.usedExpressions = [];
          this.allExpressionsUsed = false;
          this.startGame();
        }
        catch (error) {
          alert("Die geladene Datei ist keine gültige JSON-Datei.");
          console.log("error");
        }
      }
      reader.readAsText(file);
    },

    initializeScores() {
      if (Object.entries(this.scores).length === 0) {
        this.students.forEach(student => {
          this.scores[student.firstName] = 0;
          this.initialScores[student.firstName] = 0;
        });
      }
      else {
        console.log("won't set scores to zero.");
      }
    },
    startGame() {
      if (this.expressions.length === 0) {
        alert("No expressions loaded!");
        return;
      }
      else {
        this.started = true;
      }
      this.initializeScores();
      this.disableWeel;
    },
    generateCombination(student) {

      if (this.usedExpressions.length === this.expressions.length) {
        this.allExpressionsUsed = true;
        return;
      }
      this.playSound("spin.wav");
      let randomStudent = student || students[Math.floor(Math.random() * students.length)];
      this.currentStudent = randomStudent;
      let randomExpression;

      do {
        randomExpression = this.expressions[Math.floor(Math.random() * this.expressions.length)];
      } while (this.usedExpressions.includes(randomExpression.expression));

      if (!randomExpression) {
        this.allExpressionsUsed = true;
        return;
      }
      else { this.currentExpression = randomExpression; }
      this.usedExpressions.push(randomExpression.expression);
      this.currentCombination = `${randomStudent.firstName} ${randomStudent.lastName} erklärt: ${randomExpression.expression}`;
      this.currentSolution = randomExpression.description_short;
      this.showSolution = false;
      this.countdown = 10 + randomExpression.complexity * 2;
      return randomStudent;
    },
    handleCountdownCompleted() {
      this.playSound("timesup.wav");
    },
    toggleSolution() {
      this.showSolution = !this.showSolution;
    },
    playSound(fileName) {
      if (playSounds) {
        const audio = new Audio(require(`@/assets/${fileName}`));
        audio.play();
      }
    },
    answerGiven(correct) {
      this.disableWeel = false;
      let randomStudent = this.currentStudent;
      let currentExpression = this.currentExpression;
      let points = currentExpression.complexity
      if (!correct) {
        points = Math.round((points - 10) / 2);
      }
      if (randomStudent) {
        const soundFile = correct ? "correct.wav" : "wrong.wav";
        this.scores[randomStudent.firstName] = (this.scores[randomStudent.firstName] || 0) + points;
        this.playSound(soundFile);
      }
    },
  },
  components: {
    WeelOfFortune,
    HeaderComponent,
    ScoreboardComponent,
    QuizComponent,
  },
};
</script>
<style>
#wrapper {
  display: grid;
  grid-template-rows: 1fr 3fr 1fr 2fr;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-areas:
    "header header header header"
    "quiz quiz wheel wheel"
    "countdown score wheel wheel"
    "hint score wheel wheel";
  margin: auto;
  width: 1600px;
  height: 800px;
  gap: 10px;
}

.header-component {
  grid-area: header;
}

.quiz-component {
  grid-area: quiz;
}

.scoreboard-component {
  grid-area: score;
}

.countdown-component {
  grid-area: countdown;
}

#hint {
  grid-area: hint;
}

.weel-of-fortune {
  grid-area: wheel;
  font-family: "Comic Sans MS", serif;
}

button {
  cursor: pointer;
  height: 50px;
  margin: 1em;
  background-color: palevioletred;
  border: none;
  border-radius: 5px;
  color: white;
}



#start,
#save {
  width: 400px;
}

#correct,
#wrong {
  width: 200px;
}
</style>