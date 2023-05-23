<template>
  <div>
    <header-component @fileSelected="onFileSelected" />
    <div v-if="!allExpressionsUsed && started">
      <div v-if="currentCombination">
        <button id="correct" @click="answerGiven(true)">Richtig</button>
        <button id="wrong" @click="answerGiven(false)">Falsch</button>
        <button id="solution" @click="toggleSolution">Lösung</button>
      </div>
      <p class="task">{{ currentCombination }}</p>
      <p v-if="started">Komplexität: {{ currentExpression.complexity }}</p>
      <p v-if="showSolution">{{ currentSolution }}</p>
      <countdown-component :start="countdown" v-if="!allExpressionsUsed && started"
        @countdownCompleted="handleCountdownCompleted" />
      <weel-of-fortune @selection="(msg) => { disableWeel = true; generateCombination(msg) }" :disabled="disableWeel" />
    </div>

    <div v-else-if="started">
      <p>All expressions have been used!</p>
    </div>
    <scoreboard-component v-if="started && students" :scores="expressionCounts" :allExpressionsUsed="allExpressionsUsed"
      :students="students" />
  </div>
</template>

<script>
import students from "@/data/students.json";
import HeaderComponent from './components/HeaderComponent.vue';
import CountdownComponent from './components/CountdownComponent.vue'
import ScoreboardComponent from './components/ScoreboardComponent.vue';
import WeelOfFortune from "./components/WeelOfFortune.vue";

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
      countdown: 20
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
      let points = currentExpression.complexity - (correct ? 0 : 10);
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
.task {
  font-size: 2em;
  font-family: "Comic Sans MS", sans-serif;
}

button {
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