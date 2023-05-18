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
      <p>Komplexität: {{ currentExpression.complexity }}</p>
      <p v-if="!allExpressionsUsed && started" :class="{ 'time-up': countdown <= 0 }" class="countdown">{{ countdown }}
      </p>
      <p v-if="showSolution">{{ currentSolution }}</p>
      <WeelOfFortune @selection="(msg) => { disableWeel = true; generateCombination(msg) }" :disabled="disableWeel" />
    </div>
    <div v-else-if="started">
      <p>All expressions have been used!</p>
      <div id="count">
        <div v-for="(count, name) in expressionCounts" :key="name">
          {{ name }}: {{ count }}
        </div>
        <button id="save" @click="saveFinalOverview">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import students from "@/data/students.json";
import HeaderComponent from './components/HeaderComponent.vue';
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
      expressionCounts: {},
      started: false,
      showSolution: false,
      currentSolution: "",
      currentStudent: {},
      disableWeel: false,
      countdown: 20,
      countdownIntervalId: null,
    };
  },
  mounted() {
    for (let i = 0; i < students.length; i++) {
      this.expressionCounts[students[i].firstName] = 0;
    }
    let finalOverview = localStorage.getItem(localStorageKey);
    if (finalOverview) {
      this.expressionCounts = JSON.parse(finalOverview);
      console.log("ranking from localStorage successfully loaded.");
      console.log(this.expressionCounts);
    }
    else {
      console.log("no ranking found.")
    }
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
    startGame() {
      if (this.expressions.length === 0) {
        alert("No expressions loaded!");
        return;
      }
      else {
        this.started = true;
      }
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
      this.startCountdown(10 + randomExpression.complexity * 2);
      return randomStudent;
    },
    startCountdown(time = 20) {
      if (this.countdownIntervalId) {
        clearInterval(this.countdownIntervalId);
      }
      this.countdown = time;
      this.countdownIntervalId = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownIntervalId);
          this.playSound("timesup.wav");
        }
      }, 1000);
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
      // let randomStudent = this.generateCombination();
      let randomStudent = this.currentStudent;
      let currentExpression = this.currentExpression;
      console.log(currentExpression.expression);
      let points = currentExpression.complexity - (correct ? 0 : 10);
      console.log(points);
      if (randomStudent) {
        if (!this.expressionCounts[randomStudent.firstName]) {
          this.expressionCounts[randomStudent.firstName] = 0;
        }
        const soundFile = correct ? "correct.wav" : "wrong.wav";
        this.expressionCounts[randomStudent.firstName] += points;
        this.playSound(soundFile);
      }
    },

    saveFinalOverview() {
      localStorage.setItem(localStorageKey, JSON.stringify(this.expressionCounts));
    }
  },
  components: {
    WeelOfFortune,
    HeaderComponent
  },
};
</script>
<style scoped>
header {
  display: block;
  text-overflow: clip;
  height: 100px;
}

.file-input-container {
  position: relative;
  display: inline-block;
}

.file-input-container input[type="file"] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input-container label {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
}

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

.countdown {
  font-size: 3em;
}

.time-up {
  color: red;
}
</style>