<template>
    <div class="card mr-3" style="width: auto;">
      <img :src="ticket.imageUrl" class="card-img-top event-image" :alt="ticket.eventName">
      
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">{{ ticket.eventName }}</h5>
        <p class="card-text">Category: {{ ticket.category }}</p>
        <p class="card-text">Date: {{ ticket.date }}</p>
        <p class="card-text">Location: {{ ticket.location }}</p>
        <p class="card-text" v-if="ticket.seatCategory">Seat Category: {{ ticket.seatCategory }}</p>
        <p class="card-text" v-if="ticket.section">Section: {{ ticket.section }}</p>
        <p class="card-text" v-if="ticket.seatNumber">Seat Number: {{ ticket.seatNumber }}</p>
        <p class="card-text text-success">Price: ${{ ticket.price }}</p>
        <router-link 
        :to="{ name: 'ListedEvent', params: { id: ticket.id } }"
        class="mt-auto btn btn-primary"
      >Buy Ticket </router-link>
        </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TicketCard',
    props: {
      ticket: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .text-success {
    color: #2c685e !important;
  }

  .card {
    height: 100%;
    margin: 10px; 
  }

  .dark-mode .card {
    background-color: #f1e6e2;
  }
  
  .event-image {
    width: auto; 
    height: auto; 
    object-fit: cover; 
  }

  .btn-primary {
    background-color: #2c685e;
    border: #2c685e;
  }
  </style>
  