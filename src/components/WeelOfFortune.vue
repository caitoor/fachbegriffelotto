<template lang="">
    <div>
    <FortuneWheel
    ref="wheelEl"
      style="width: 500px; max-width: 100%;"
      :verify="canvasVerify"
      :canvas="canvasOptions"
      :prizes="prizesCanvas"
      :duration="verifyDuration"
      :textDirection="'vertical'"
      angleBase="5"
      @rotateStart="onCanvasRotateStart"
      @rotateEnd="onRotateEnd"
      :disabled="disabled"
    />   
    </div>
</template>
<script>

import FortuneWheel from 'vue-fortune-wheel'
import 'vue-fortune-wheel/style.css'
import colors from '../data/colors.json';

export default {
    components: {
        FortuneWheel
    },
    data() {
        return {
            prizeId: 0,
            canvasVerify: false, // Whether the turntable in canvas mode is enabled for verification
            verifyDuration: 1000,
            canvasOptions: {
                btnWidth: 140,
                borderColor: '#584b43',
                borderWidth: 6,
                lineHeight: 30,
                btnText: "Start",
            },
            colors: colors.segments,
            prizesCanvas: [],


        }
    },
    props: {
        students: {
            type: Object,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    created() {
        let studentProbability = parseInt(100 / (this.students.length));
        this.prizesCanvas = this.students.map((student, index) => {
            (index === this.students.length - 1) ? studentProbability = 100 - (studentProbability * (this.students.length - 1)) : null;
            return {
                id: index + 1,
                name: student.firstName,
                value: student.firstName + "_" + student.lastName,
                bgColor: this.colors[index].color,
                color: this.colors[index].textColor,
                probability: studentProbability,
                useWeight: false,
            }
        })
    },
    methods: {
        onCanvasRotateStart() {
            // console.log('onRotateStart')
        },
        onRotateEnd(prize) {
            this.canvasOptions.btnText = "";
            this.$emit('selection', prize.value)
            this.prizeId = prize.id
        },
    },
    emits: ['selection', 'spinWeel'],
    watch: {
        disabled: function (val) {
            if (!val) {
                setTimeout(() => { // Todo - find a better way to do this
                    this.$refs.wheelEl.startRotate()
                }, 1)
            }
        }
    }
}
</script>
<style scoped>
.weel-part {
    width: 100%;
    height: 100%;
    background-color: #a63535;
    border-radius: 100%;
}
</style>