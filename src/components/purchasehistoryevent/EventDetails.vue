<template>
  <div class="event-details">
    <h2>{{ event.eventName }}</h2>
    <p><strong>Date:</strong> {{ formattedDate }}</p>
    <p><strong>Time:</strong> {{ event.time }}</p>
    <p><strong>Location:</strong> {{ event.location }}</p>
  </div>
</template>

<script>
export default {
  name: 'EventDetails',
  props: ['event'],
  computed: {
    formattedDate() {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(this.event.date).toLocaleDateString(undefined, options);
    },
  },
};
</script>

<style scoped>
.event-details {
  /* Add styles if needed */
}
</style>