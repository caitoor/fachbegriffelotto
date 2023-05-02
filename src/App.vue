<template>
  <div>
    <h1>Random Student and Expression</h1>
    <button @click="pickRandomCombination" :disabled="allExpressionsUsed">
      Pick Random Combination
    </button>
    <p v-if="allExpressionsUsed">All expressions have been used</p>
    <p class="result">{{ randomCombination }}</p>
  </div>
</template>

<script>
import students from "@/_examples/students.json";
import expressions from "@/_examples/expressions.json";

export default {
  data() {
    return {
      usedExpressions: [],
      randomCombination: "",
    };
  },
  computed: {
    allExpressionsUsed() {
      return this.usedExpressions.length === expressions.length;
    },
  },
  methods: {
    pickRandomCombination() {
      const unusedExpressions = expressions.filter(
        (expression) => !this.usedExpressions.includes(expression.expression)
      );
      if (unusedExpressions.length === 0) {
        this.randomCombination = "All expressions have been used";
        return;
      }
      const randomStudent =
        students[Math.floor(Math.random() * students.length)];
      const randomExpression =
        unusedExpressions[Math.floor(Math.random() * unusedExpressions.length)];
      this.usedExpressions.push(randomExpression.expression);
      this.randomCombination = `${randomStudent.firstName} ${randomStudent.lastName} - ${randomExpression.expression}`;
    },
  },
};
</script>
<style scoped>
.result {
  font-size: 2em;
}
</style>