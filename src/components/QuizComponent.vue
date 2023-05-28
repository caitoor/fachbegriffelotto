<template>
    <div v-if="!allExpressionsUsed && started">
        <p class="task">{{ currentCombination }}</p>
        <p>Nr. {{ usedExpressionsCount }} / {{ totalExpressions }}</p>
        <p v-if="started">Komplexität: {{ currentExpression.complexity }}</p>
        <div v-if="currentCombination">
            <button id="correct" @click="$emit('answerGiven', true)">Richtig</button>
            <button id="wrong" @click="$emit('answerGiven', false)">Falsch</button>
        </div>
        <countdown-component class="countdown-component" :start="countdown" v-if="!allExpressionsUsed && started"
            @countdownCompleted="$emit('countdownCompleted')" />
    </div>
    <div v-else-if="started">
        <p>All expressions have been used!</p>
    </div>
</template>
  
<script>
import CountdownComponent from './CountdownComponent.vue';

export default {
    name: 'QuizComponent',
    components: {
        CountdownComponent
    },
    props: {
        allExpressionsUsed: Boolean,
        started: Boolean,
        currentCombination: String,
        usedExpressionsCount: Number,
        totalExpressions: Number,
        currentExpression: Object,
        countdown: Number
    }
}
</script>
  
<style scoped>
.task {
    font-size: 2em;
    font-family: "Comic Sans MS", sans-serif;
}

#correct {
    background-color: #4caf50;
}

#wrong {
    background-color: crimson;
}
</style>
  