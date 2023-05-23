<template>
  <header>
    <h1>☆ Lustiges Fachbegriffe-Lotto ☆</h1>
    <input id="file-input" type="file" @change="handleFileSelect" />
  </header>
</template>
  
<script>
export default {
  name: 'HeaderComponent',
  methods: {
    handleFileSelect(event) {
      this.$emit('fileSelected', event);
    }
  },
}
</script>

<style scoped>
header {
  display: block;
  text-overflow: clip;
  height: 100px;
  grid-area: header;
}

h1 {
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