<template>
  <header>
    <h2>☆ Lustiges Fachbegriffe-Lotto ☆</h2>
    <h3>{{ courseHeadline }}</h3>
    <span>Kurs:</span><input id="file-input" type="file" @change="handleCourseSelect" />
    <span>Begriffe laden:</span><input id="file-input" type="file" @change="handleExpressionsSelect" />
  </header>
</template>
  
<script>
export default {
  name: 'HeaderComponent',
  props: {
    course: {
      type: Object,
      required: false
    }
  },
  methods: {
    handleCourseSelect(event) {
      this.$emit('courseSelected', event);
    },
    handleExpressionsSelect(event) {
      this.$emit('expressionsSelected', event);
    }
  },
  computed: {
    courseHeadline() {
      let headline = "no course loaded."
      if (Object.entries(this.course).length > 0) {
        headline = this.course.class + " | " + this.course.course + " | " + this.course.semester;
      }
      return headline;
    }
  }
}
</script>

<style scoped>
header {
  background-color: greenyellow;
}

h2 {
  font-family: "Matura MT Script Capitals", serif;
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
</style>