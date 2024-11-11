<template>
  <div class="about-section">
    <h5>About:</h5>
    <p>
      {{ event.description }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'AboutSection',
  props: ['event'],
};
</script>

<style scoped>
.about-section {
  /* Add styles if needed */
}
</style>