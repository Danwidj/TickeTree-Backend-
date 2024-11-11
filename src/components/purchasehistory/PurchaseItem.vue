<template>
  <div class="purchase-item">
    <div class="event-image-container">
      <img :src="ticket.imageUrl" alt="Event Image" class="event-image" />
    </div>
    <div class="event-details">
      <h2>{{ ticket.eventName }}</h2>
      <p class="date">
      Date:
      <span v-if="ticket.endDate">
        {{ ticket.startDate.toLocaleDateString() }} - {{ ticket.endDate.toLocaleDateString() }}
      </span>
      <span v-else>
        {{ ticket.startDate.toLocaleDateString() }}
      </span>
    </p>
      <p class="seat">Seat: {{ ticket.seatNumber }}</p>
    </div>
    <div class="event-price">
      <span class="price">${{ ticket.price }}</span>
      <span class="badge-status paid">Paid</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});

const ticketStatus = computed(() => {
  const currentDate = new Date();
  if (currentDate < props.ticket.startDate) {
    return 'Upcoming';
  } else if (currentDate >= props.ticket.startDate && currentDate <= props.ticket.endDate) {
    return 'Ongoing';
  } else {
    return 'Past';
  }
});
</script>


<style scoped>
.purchase-item {
  display: flex;
  align-items: center;
  background-color: #f1f2f5;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 100%;
  gap: 16px;
}

.event-image-container {
  flex: 0 0 120px;
}

.event-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.event-details {
  flex-grow: 1;
}

.event-details h2 {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.date {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.seat {
  font-size: 0.9rem;
  color: #666;
}

.event-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.badge-status {
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #007bff;
  color: #fff;
  text-align: center;
}
</style>