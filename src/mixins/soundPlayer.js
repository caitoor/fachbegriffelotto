export default {
    props: {
      playSounds: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      playSound(fileName) {
        if (this.playSounds) {
          const audio = new Audio(require(`@/assets/${fileName}`));
          audio.play();
        }
      }
    }
  }
  