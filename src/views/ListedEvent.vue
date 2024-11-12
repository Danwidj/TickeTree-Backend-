<template>
  <div class="poster-section">
    <!-- Background and Poster Image Section -->
    <div
      class="background-layer"
      :style="{
        backgroundImage: `url(${event?.imageUrl || '/images/noimage.png'})`,
      }"
    ></div>
    <div class="poster d-flex justify-content-center align-items-center">
      <img
        :src="event?.imageUrl || '/images/noimage.png'"
        class="img-fluid shadow-lg rounded poster-img"
        alt="Event Poster"
      />
    </div>
    <hr class="custom-hr" />
  </div>

  <div class="container justify-content-center gap-4 mb-4">
    <div class="card w-100">
      <!-- Event Details -->
      <div class="container mt-4 text-center event-details">
        <h2 class="event-title">{{ event?.eventName || "Event Title" }}</h2>
        <div class="d-block justify-content-center gap-5 text-muted">
          <p class="h5">
            <i class="fa fa-calendar"></i>
            {{ event?.date || "November 30, 2024" }}
          </p>
          <p class="h5">
            <i class="fa fa-clock"></i> {{ event?.time || "6:00 PM" }}
          </p>
          <p class="h5">
            <i class="fa fa-map-marker"></i> {{ event?.location }}
          </p>
        </div>
      </div>

      <div class="card-body d-flex row">
        <!-- About Section -->
        <div class="about-section col-8 p-3">
          <h5>About:</h5>
          <p>
            {{
              event?.description ||
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }}
          </p>
        </div>

        <!-- Ticket Purchase Button Section -->
        <div class="price-section col-4 text-center p-3">
          <h4 class="text-success">Price: ${{ event?.price || "$500" }}</h4>
          <button @click="handleTicketPurchase" class="btn btn-success btn-lg animate-pulse">
            Buy Ticket
          </button>
          <!-- Display message if ticket is already in the cart -->
          <p v-if="cartMessage" class="text-danger mt-2">{{ cartMessage }}</p>
        </div>
      </div>

      <!-- Price History Chart Section -->
      <div class="container price-history col-12" v-if="event">
        <h5 class="ms-3">Price History</h5>
        <Chart :eventName="event.eventName" id="chart" />
      </div>
      <div class="mt-4" v-else>
        <p>Loading price history...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTicketStore } from "@/stores/ticketStore";
import { useCartStore } from "@/stores/cartStore";
import Chart from "@/components/marketplace/Chart.vue";
import anime from "animejs/lib/anime.es.js";

export default {
  name: "ListedEvent",
  props: {
    id: String,
  },
  components: {
    Chart,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const eventId = route.params.id;
    const event = ref(null);
    const ticketStore = useTicketStore();
    const cartStore = useCartStore();
    const cartMessage = ref(""); // Message to indicate if the item is already in the cart

    onMounted(async () => {
      event.value = await ticketStore.fetchTicketById(eventId);


    anime({
    targets: ".poster",
    scale: [0.1, 1],
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 3000,
  });

  anime({
    targets: ".container.justify-content-center.gap-4.mb-4",
    scale: [0.95, 1],
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 5000,
  });

  anime({
    targets:
      ".event-title, .event-details p, .about-section,.price-section,.location-map,.how-to-get-there",
    translateY: [20, 0],
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 6000,
    delay: anime.stagger(200, { start: 300 }),
  });
    });

    // Handle ticket purchase action
    function handleTicketPurchase() {
      if (event.value) {
        const isAlreadyInCart = cartStore.cartItems.some(
          (item) => item.id === event.value.id
        );

        if (isAlreadyInCart) {
          cartMessage.value = "Ticket already added to cart"; // Set the message if the item is already in the cart
        } else {
          cartStore.addTicketToCart(event.value); // Add ticket to the cart
          router.push("/payment"); // Navigate to payment page
        }
      } else {
        console.error("Event not found, cannot add to cart");
      }
    }

    return {
      event,
      handleTicketPurchase,
      cartMessage,
    };
  },
};
</script>


<style scoped>
.poster-section {
  position: relative;
  overflow: hidden;
  height: 500px;
}

/* Background Layer with Blur and Overlay */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80%;
  background-size: cover;
  background-position: center;
  filter: blur(5px);
  -webkit-filter: blur(5px);
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.4);
  mix-blend-mode: darken;
}

.poster {
  position: relative;
  z-index: 2;
}

.poster-img {
  max-height: 400px;
  height: fit-content;
  border-radius: 10px;
}

.custom-hr {
  border: 1px solid #ddd;
  width: 80%;
  margin: 20px auto;
}

@media (max-width: 575px) {
  .poster-section {
    height: 40vh;
  }

  .background-layer {
    height: 100%;
    filter: blur(0);
    background-size: cover;
    background-position: center;
  }
  .poster {
    display: none;
  }
  .background-layer {
    display: none;
  }
  .poster-img {
    height: 40vh;
  }
}
.card {
  background-color: whitesmoke;
  border-radius: 10px;
}

.card-body {
  margin: auto;
  width: 100%;
}

.event-title {
  font-size: 3em;
  font-weight: bold;
  animation: fade-in 1.5s ease-in-out;
}

.about-section {
  margin: auto;
}

.text-muted {
  font-size: 0.9em;
  color: #6c757d !important;
}

.pricing-section .price-info {
  background-color: #f9f9f9;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

.btn-success {
  background-color: #2c685e !important;
}

.text-success {
  color: #2c685e !important;
}

.price-history {
  margin-top: 1.5rem;
  margin: auto;
}

#chart {
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin: auto;
}

/* @keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
} */

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
