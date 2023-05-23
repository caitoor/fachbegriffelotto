<template>
    <div class="countdown" v-bind:class="{ 'low-time': isTimeLow }">
        <span>{{ timeLeft }}</span>
    </div>
</template>

<script>
export default {
    name: 'CountdownComponent',
    props: {
        start: {
            type: Number,
            default: null
        }
    },
    watch: {
        start: function (newStart) {
            if (newStart !== null) {
                this.startCountdown(newStart);
            }
        }
    },
    data() {
        return {
            timeLeft: null,
            intervalId: null,
        };
    },
    methods: {
        startCountdown(seconds) {
            this.timeLeft = seconds;

            if (this.intervalId) {
                clearInterval(this.intervalId);
            }

            this.intervalId = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    clearInterval(this.intervalId);
                    this.$emit('countdownCompleted');
                }
            }, 1000);
        },
    },
    computed: {
        isTimeLow() {
            return this.timeLeft <= 5;
        },
    },
    beforeUnmount() {
        clearInterval(this.intervalId);
    },
};
</script>

<style scoped>
.countdown {
    font-size: 3em;
    grid-area: countdown;
}

.low-time {
    color: red;
}
</style>