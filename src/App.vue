<template>
  <div id="wrapper">
    <header-component class="header-component" @expressionsSelected="onExpressionsSelected" :course="course"
      @courseSelected="onCourseSelected" />
    <quiz-component v-if="started" class="quiz-component" :all-expressions-used="allExpressionsUsed" :started="started"
      :current-combination="currentCombination" :used-expressions-count="usedExpressions.length"
      :total-expressions="expressions.length" :current-expression="currentExpression" :countdown="countdown"
      @answerGiven="answerGiven" @countdownCompleted="handleCountdownCompleted" @rerollStudent="rerollStudent" />
    <div id="hint" v-if="started">
      <button id="solution" @click="toggleSolution">Lösung</button>
      <p v-if="showSolution">{{ currentSolution }}</p>
    </div>
    <scoreboard-component class="scoreboard-component" v-if="started && students" :localStorageKey="localStorageKey"
      :scores="scores" :initial-scores="initialScores" :student-stats="studentStats"
      :initialStudentStats="initialStudentStats" :allExpressionsUsed="allExpressionsUsed" :students="students"
      :course-key="courseKey" />
    <weel-of-fortune v-if="started && students" class="weel-of-fortune" :students="this.course.students"
      @selection="(msg) => { disableWeel = true; generateCombination(msg) }" :disabled="disableWeel" />
  </div>
</template>

<script>
//import course from "@/data/class.json";
import HeaderComponent from './components/HeaderComponent.vue';
import QuizComponent from './components/QuizComponent';
import ScoreboardComponent from './components/ScoreboardComponent.vue';
import WeelOfFortune from "./components/WeelOfFortune.vue";
import soundPlayer from './mixins/soundPlayer';
const localStorageKey = process.env.VUE_APP_LOCAL_STORAGE_KEY;
export default {
  mixins: [soundPlayer],
  data() {
    return {
      localStorageKey: localStorageKey,
      started: false,
      disableWeel: false,
      showSolution: false,
      countdown: 20,
      expressions: [],
      usedExpressions: [],
      allExpressionsUsed: false,
      currentSolution: "",
      currentStudentId: "",
      currentStudent: {},
      currentExpression: {},
      currentCombination: "",
      students: {},
      course: {},
      courseKey: "",
      scores: {},
      initialScores: {},
      studentStats: {},
      initialStudentStats: {},
      playSounds: process.env.VUE_APP_PLAY_SOUNDS === 'true',
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
    //load lastly used class
    const existingCourseData = localStorage.getItem(this.localStorageKey + "_course");
    if (existingCourseData) {
      const existingCourse = JSON.parse(existingCourseData);
      if (existingCourse) {
        this.course = JSON.parse(JSON.stringify(existingCourse));
        this.initializeCourse();
        console.log("Course from localStorage successfully loaded.");
        this.initializeCourseScores();
      } else {
        console.log("No course found.");
      }
    } else {
      console.log("No course data in localStorage.");
    }
  },
  methods: {
    onExpressionsSelected(event) {
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
          alert("Die geladene Datei ist keine gültige JSON-Fachbegriffe-Datei.");
          console.log("error");
        }
      }
      reader.readAsText(file);
    },
    onCourseSelected(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          localStorage.setItem(this.localStorageKey + "_course", JSON.stringify(data));
          this.course = data;
          this.initializeCourse();
          this.initializeCourseScores();
        }
        catch (error) {
          alert("Die geladene Datei ist keine gültige JSON-Kurs-Datei.");
          console.log("error");
        }
      }
      reader.readAsText(file);
    },
    initializeCourse() {
      this.courseKey = (this.course.class + "_" + this.course.course + "_" + this.course.semester).toLowerCase().replace(/\s/g, '')
      let studs = this.course.students;
      let studObj = {};
      studs.forEach(student => {
        const key = student.firstName + "_" + student.lastName;
        studObj[key] = { ...student };
        this.studentStats[key] = { attempts: 0, correct: 0 };
      });
      this.students = { ...studObj };
    },
    initializeScores() {
      if (Object.entries(this.scores).length === 0) {
        for (let studId in this.students) {
          this.scores[studId] = 0;
          this.initialScores[studId] = 0;
        }
      }
      else {
        console.log("won't set scores to zero.");
      }
    },
    initializeCourseScores() {
      const existingRankingData = localStorage.getItem(this.localStorageKey + "_ranking_" + this.courseKey);
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
        console.log("No ranking data in localStorage.");
      }
      const existingStudentStatsData = localStorage.getItem(this.localStorageKey + "_studentStats_" + this.courseKey);
      if (existingStudentStatsData) {
        const existingStudentStats = JSON.parse(existingStudentStatsData);
        if (existingStudentStats) {
          this.studentStats = JSON.parse(JSON.stringify(existingStudentStats));
          this.initialStudentStats = JSON.parse(JSON.stringify(existingStudentStats));
          console.log("StudentStats from localStorage successfully loaded.");
        } else {
          console.log("No studentStats found.");
        }
      } else {
        console.log("No studentStats data in localStorage.");
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
    generateCombination(studentID) {
      if (this.usedExpressions.length === this.expressions.length) {
        this.allExpressionsUsed = true;
        return;
      }
      this.playSound("spin.wav");

      const studentIds = Object.keys(this.students);
      const randomIndex = Math.floor(Math.random() * studentIds.length);
      const randomStudentId = studentIds[randomIndex];
      let randomStudent = this.students[studentID] || this.students[randomStudentId]
      this.currentStudentId = studentID;
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
      this.countdown = Math.floor(10 + randomExpression.complexity * 1.5);
      return randomStudent;
    },
    answerGiven(correct) {
      this.disableWeel = false;
      let randomStudent = this.currentStudent;
      let currentExpression = this.currentExpression;
      let points = currentExpression.complexity;
      if (!correct) {
        points = Math.round((points - 10) / 2);
      }
      if (randomStudent) {
        const soundFile = correct ? "correct.wav" : "wrong.wav";
        this.scores[this.currentStudentId] = (this.scores[this.currentStudentId] || 0) + points;
        this.studentStats[this.currentStudentId].attempts += 1;
        if (correct) {
          this.studentStats[this.currentStudentId].correct += 1;
        }
        this.playSound(soundFile);
      }
    },
    handleCountdownCompleted() {
      this.playSound("timesup.wav");
    },
    toggleSolution() {
      this.showSolution = !this.showSolution;
    },
    rerollStudent() {
      this.playSound("spin.wav");
      this.generateStudent();
    },

    generateStudent() {
      const studentIds = Object.keys(this.students);
      let randomIndex;
      let randomStudentId;
      do {
        randomIndex = Math.floor(Math.random() * studentIds.length);
        randomStudentId = studentIds[randomIndex];
      } while (randomStudentId === this.currentStudentId);

      this.currentStudentId = randomStudentId;
      this.currentStudent = this.students[randomStudentId];
      this.currentCombination = `${this.currentStudent.firstName} ${this.currentStudent.lastName} erklärt: ${this.currentExpression.expression}`;
    }
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
  max-height: 900px;
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