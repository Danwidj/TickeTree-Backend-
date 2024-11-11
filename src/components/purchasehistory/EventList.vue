<template>
  <div class="events-list">
    <PurchaseItem
      v-for="ticket in filteredTickets"
      :key="ticket.id"
      :ticket="ticket"
    />
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import PurchaseItem from './PurchaseItem.vue';

const props = defineProps({
  tickets: Array,
  currentTab: String,
});

// Filter tickets based on the current tab
const filteredTickets = computed(() => {
  const currentDate = new Date();
  return props.tickets.filter(ticket => {
    if (props.currentTab === 'upcoming') {
      return ticket.startDate > currentDate;
    } else {
      return ticket.endDate < currentDate;
    }
  });
});
</script>

<style scoped>
.events-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
