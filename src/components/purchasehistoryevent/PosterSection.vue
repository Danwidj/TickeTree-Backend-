<template>
  <div
    class="blurred-background p-0 m-0 container-fluid mt-4 d-flex justify-content-center align-items-center"
    :style="blurredBackgroundStyle"
  >
    <div class="poster">
      <img
        :src="event.image"
        class="img-fluid"
        alt="Event Poster"
        style="max-height: 400px;"
      />
    </div>
  </div>
  <hr />
</template>

<script>
export default {
  name: 'PosterSection',
  props: ['event'],
  computed: {
    blurredBackgroundStyle() {
      return {
        '--background-image': `url(${this.event.image})`,
      };
    },
  },
};
</script>

<style scoped>
hr {
  margin: 0;
  padding: 0;
  height: 2px;
}

.blurred-background {
  margin: 0px;
  position: relative;
  color: white;
  text-align: center;
  overflow: hidden;
  height: 400px;
  width: 100vw;
}

.blurred-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--background-image);
  background-size: cover;
  background-position: center;
  filter: blur(10px);
  z-index: -1;
}

.poster {
  position: relative;
  z-index: 1;
}
</style>