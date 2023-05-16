<template>
  <div>
    <header>
      <h1>☆ Lustiges Fachbegriffe-Lotto ☆</h1>
      <input id="file-input" type="file" @change="onFileSelected" />
    </header>
    <button id="start" v-if="!started" @click="generateCombination">☆ START ☆</button>
    <div v-else>
      <button id="correct" @click="answerGiven(true)">Richtig</button>
      <button id="wrong" @click="answerGiven(false)">Falsch</button>
      <button id="solution" @click="toggleSolution">Lösung</button>
    </div>
    <p class="task">{{ currentCombination }}</p>
    <p v-if="showSolution">{{ currentSolution }}</p>
    <p v-if="allExpressionsUsed">All expressions have been used!</p>
    <div v-if="allExpressionsUsed" id="count">
      <div v-for="(count, name) in expressionCounts" :key="name">
        {{ name }}: {{ count }}
      </div>
      <button id="save" @click="saveFinalOverview">Save</button>
    </div>
  </div>
</template>

<script>
import students from "@/data/students.json";
const localStorageKey = process.env.LOCAL_STORAGE_KEY;
export default {
  data() {
    return {
      expressions: [],
      currentCombination: "",
      usedExpressions: [],
      allExpressionsUsed: false,
      expressionCounts: {},
      started: false,
      showSolution: false,
      currentSolution: "",
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
      };
      reader.readAsText(file);
    },
    generateCombination() {

      if (this.expressions.length === 0) {
        alert("No expressions loaded!");
        return;
      }
      else {
        this.started = true;
      }
      if (this.usedExpressions.length === this.expressions.length) {
        this.allExpressionsUsed = true;
        return;
      }
      let randomStudent = students[Math.floor(Math.random() * students.length)];
      let randomExpression;

      do {
        randomExpression = this.expressions[Math.floor(Math.random() * this.expressions.length)];
      } while (this.usedExpressions.includes(randomExpression.expression));

      if (!randomExpression) {
        this.allExpressionsUsed = true;
        return;
      }
      this.usedExpressions.push(randomExpression.expression);
      this.currentCombination = `${randomStudent.firstName} ${randomStudent.lastName} - ${randomExpression.expression}`;
      this.currentSolution = randomExpression.description_short;
      this.showSolution = false;
      return randomStudent;
    },

    toggleSolution() {
      this.showSolution = !this.showSolution;
    },

    answerGiven(correct) {
      let randomStudent = this.generateCombination();
      if (randomStudent) {
        if (!this.expressionCounts[randomStudent.firstName]) {
          this.expressionCounts[randomStudent.firstName] = 0;
        }
        this.expressionCounts[randomStudent.firstName] += correct ? 1 : -1;
      }
    },

    saveFinalOverview() {
      localStorage.setItem(localStorageKey, JSON.stringify(this.expressionCounts));
    }
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