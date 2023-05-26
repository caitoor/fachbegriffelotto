<template>
  <div id="wrapper">
    <header-component class="header-component" @fileSelected="onFileSelected" />
    <div v-if="!allExpressionsUsed && started" id="quiz">
      <p class="task">{{ currentCombination }}</p>
      <p v-if="started">Komplexität: {{ currentExpression.complexity }}</p>
      <div v-if="currentCombination">
        <button id="correct" @click="answerGiven(true)">Richtig</button>
        <button id="wrong" @click="answerGiven(false)">Falsch</button>
      </div>
      <countdown-component class="countdown-component" :start="countdown" v-if="!allExpressionsUsed && started"
        @countdownCompleted="handleCountdownCompleted" />
    </div>
    <div v-else-if="started">
      <p>All expressions have been used!</p>
    </div>
    <div id="hint" v-if="started"><button id="solution" @click="toggleSolution">Lösung</button></div>
    <p v-if="showSolution">{{ currentSolution }}</p>
    <scoreboard-component class="scoreboard-component" v-if="started && students" :localStorageKey="localStorageKey"
      :scores="expressionCounts" :allExpressionsUsed="allExpressionsUsed" :students="students" />
    <weel-of-fortune class="weel-of-fortune" @selection="(msg) => { disableWeel = true; generateCombination(msg) }"
      :disabled="disableWeel" />
  </div>
</template>

<script>
import students from "@/data/students.json";
import HeaderComponent from './components/HeaderComponent.vue';
import CountdownComponent from './components/CountdownComponent.vue'
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
      expressionCounts: {},
      countdown: 20,
      localStorageKey: localStorageKey,
    };
  },
  methods: {
    onFileSelected(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        this.expressions = data;
        this.usedExpressions = [];
        this.allExpressionsUsed = false;
        this.startGame();
      }
      reader.readAsText(file);
    },

    initializeScores() {
      this.students.forEach(student => {
        this.expressionCounts[student.firstName] = 0;
      });
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
        this.expressionCounts[randomStudent.firstName] = (this.expressionCounts[randomStudent.firstName] || 0) + points;
        this.playSound(soundFile);
      }
    },
  },
  components: {
    WeelOfFortune,
    HeaderComponent,
    CountdownComponent,
    ScoreboardComponent
  },
};
</script>
<style scoped>
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

#quiz {
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
}

.task {
  font-size: 2em;
  font-family: "Comic Sans MS", sans-serif;
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

#correct,
#wrong {
  width: 200px;
}

#start,
#save {
  width: 400px;
}

#correct {
  background-color: #4caf50;
}

#wrong {
  background-color: crimson;
}
</style>