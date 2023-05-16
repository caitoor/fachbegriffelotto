<template>
  <div>
    <header>
      <h1>
        ☆*:.｡.o(≧▽≦)o.｡.:*☆ Lustiges Fachbegriffe-Lotto ☆*:.｡.o(≧▽≦)o.｡.:*☆
      </h1>
      <input id="file-input" type="file" @change="onFileSelected" />
    </header>
    <button @click="generateCombination">Generate Combination</button>
    <p class="task">{{ currentCombination }}</p>
    <p v-if="allExpressionsUsed">All expressions have been used!</p>
    <div v-if="allExpressionsUsed" id="count">
      <div v-for="(count, name) in expressionCounts" :key="name">
        {{ name }}: {{ count }}
      </div>
      <button @click="saveFinalOverview">Save</button>
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
    };
  },
  mounted() {
    for (let i = 0; i < students.length; i++) {
      this.expressionCounts[students[i].firstName] = 0;
    }
    let finalOverview = localStorage.getItem(localStorageKey);
    if (finalOverview) {
      this.expressionCounts = JSON.parse(finalOverview);
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
      if (this.usedExpressions.length === this.expressions.length) {
        this.allExpressionsUsed = true;
        return;
      }
      let randomStudent = students[Math.floor(Math.random() * students.length)];
      let randomExpression;

      // Versuche zufällige Fachbegriffe zu erzeugen, bis man einen noch nicht verwendeten findet.
      do {
        randomExpression = this.expressions[Math.floor(Math.random() * this.expressions.length)];
      } while (this.usedExpressions.includes(randomExpression.expression));

      if (!randomExpression) {
        this.allExpressionsUsed = true;
        return;
      }
      this.usedExpressions.push(randomExpression.expression);
      this.currentCombination = `${randomStudent.firstName} ${randomStudent.lastName} - ${randomExpression.expression}`;
      //counting:
      if (!this.expressionCounts[randomStudent.firstName]) {
        this.expressionCounts[randomStudent.firstName] = 1;
      } else {
        this.expressionCounts[randomStudent.firstName]++;
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
  width: 400px;
}
</style>