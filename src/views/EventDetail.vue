<template>
  <div>
  <div v-if="loading">
    <span class="back d-flex align-items-center justify-content-center">
      <span>L</span>
      <span>o</span>
      <span>a</span>
      <span>d</span>
      <span>i</span>
      <span>n</span>
      <span>g</span>
    </span>
  </div>
  <div v-else class="poster-section">
    <div
      class="background-layer"
      :style="{
        backgroundImage: `url(${
          event?.images?.images[0]?.original_url || '/images/noimage.png'
        })`,
      }"
    ></div>

    <div class="poster d-flex justify-content-center align-items-center">
      <img
        :src="event?.images?.images[0]?.original_url || '/images/noimage.png'"
        class="img-fluid shadow-lg rounded poster-img"
        alt="Event Poster"
      />
    </div>
    <hr class="custom-hr" />
  </div>

  <div class="container justify-content-center gap-4 mb-4 poster-content">
    <div class="card w-100" :class="isDarkMode ? 'dark' : 'light'">
      <!-- Event Details -->
      <div class="container mt-4 text-center event-details">
        <h2 class="event-title" :class="{ lighttext: isDarkMode }">
          {{ event?.name || "Event Title" }}
        </h2>
        <div class="d-block justify-content-center gap-5 text-muted">
          <p class="h5">
            <i class="fa fa-calendar"></i>
            {{ event?.datetime_summary || "November 30, 2024" }}
          </p>
          <p class="h5">
            <i class="fa fa-clock"></i> {{ event?.time || "6:00 PM" }}
          </p>
          <p class="h5">
            <i class="fa fa-map-marker"></i> {{ event?.location_summary }}
          </p>
        </div>
      </div>

      <div class="card-body d-flex row">
        <!-- About Section -->
        <div class="about-section col-8 p-3" :class="{ lighttext: isDarkMode }">
          <h5>About:</h5>
          <p>
            {{ event?.description || "Detailed event description goes here." }}
          </p>
        </div>

        <!-- Price Section -->
        <div class="price-section col-4 text-center p-3">
          <h4 class="text-success">Price: {{ event?.price || "$50.00" }}</h4>
          <button
            @click="handleTicketPurchase"
            class="btn btn-success btn-lg animate-pulse"
          >
            Buy Ticket
          </button>
          <div class="marketplace mt-3">
            <router-link to="/marketplace">
              <button class="btn btn-outline-primary btn-lg">
                See Resale Price
              </button>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Error Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content animate-fade-in">
          <h5>Login Required</h5>
          <p class="text-muted">{{ errorMessage }}</p>
          <div class="modal-actions">
            <button @click="closeModal" class="btn login-btn">
              Go to Login
            </button>
            <button @click="showModal = false" class="btn btn-close">
            </button>
          </div>
        </div>
      </div>

      <!-- Location Map Section -->
      <div
        class="container m-4 location-map col-12"
        :class="{ lighttext: isDarkMode }"
      >
        <h5>Location:</h5>
        <div
          id="map"
          class="rounded shadow"
          style="width: 96%; height: 300px"
        ></div>
      </div>

    <div class="how-to-get-there mt-4">
          <h5>How to Get There:</h5>
          <div class="transport-options d-flex justify-content-center gap-4 mt-3">
            <a 
              @click="openDirections('driving')"
              class="transport-option"
              title="Drive there"
            >
              <div class="transport-icon">
                <i class="fa fa-car"></i>
              </div>
              <span>Drive</span>
            </a>
            <a 
              @click="openDirections('transit')"
              class="transport-option"
              title="Public transit"
            >
              <div class="transport-icon">
                <i class="fa fa-bus"></i>
              </div>
              <span>Transit</span>
            </a>
            <a 
              @click="openDirections('walking')"
              class="transport-option"
              title="Walk there"
            >
              <div class="transport-icon">
                <i class="fa fa-walking"></i>
              </div>
              <span>Walk</span>
            </a>
            <a 
              @click="openDirections('bicycling')"
              class="transport-option"
              title="Cycle there"
            >
              <div class="transport-icon">
                <i class="fa fa-bicycle"></i>
              </div>
              <span>Cycle</span>
            </a>
          </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAuth } from "firebase/auth";
import { useEventStore } from "@/stores/eventStore";
import { useCartStore } from "@/stores/cartStore";
import { inject } from "vue";
import anime from "animejs/lib/anime.es.js";

const isDarkMode = inject("isDarkMode");
const route = useRoute();
const router = useRouter();
const eventId = route.params.id;
const eventStore = useEventStore();
const loading = ref(true);
const googleMapsLoaded = ref(false);
const errorMessage = ref("");
const showModal = ref(false); // Track modal visibility

const auth = getAuth();
const isLoggedIn = ref(false); // Track login status

onMounted(async () => {
  await eventStore.loadEvents();
  eventStore.selectEventById(eventId);
  loading.value = false;

  // Check authentication status
  auth.onAuthStateChanged((user) => {
    isLoggedIn.value = !!user; // Set isLoggedIn to true if user is logged in
  });

  // Initialize map with the event location after loading event details
  if (event.value && event.value.location?.point) {
    loadGoogleMaps();
  }
    anime({
    targets: ".poster-img",
    scale: [0.1, 1],
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 3000,
  });

  anime({
    targets: ".poster-content",
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

const event = computed(() => eventStore.selectedEvent);

// Load Google Maps dynamically
function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Check if the Google Maps script is already loaded
  if (
    document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js?key=${apiKey}"]`
    )
  ) {
    if (!googleMapsLoaded.value) {
      initMap();
    }
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
  script.async = true;
  script.defer = true;
  window.initMap = initMap;
  document.head.appendChild(script);
  googleMapsLoaded.value = true;
}

async function initMap() {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { lat, lng } = event.value.location.point;
  const location = { lat, lng };

  const map = new google.maps.Map(document.getElementById("map"), {
    center: location,
    zoom: 15,
    mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
  });

  const marker = new AdvancedMarkerElement({
    map,
    position: location,
  });
}

const cartStore = useCartStore();

function handleTicketPurchase() {
  if (!isLoggedIn.value) {
    errorMessage.value = "Please log in to purchase tickets."; // Set error message if user is not logged in
    showModal.value = true; // Show modal
  } else {
    addToCart();
    errorMessage.value = ""; // Clear error message if user is logged in
    router.push("/payment"); // Navigate to payment page
  }
}

function closeModal() {
  showModal.value = false; // Close the modal
  router.push("/login"); // Redirect to login page
}

function addToCart() {
  if (event.value) {
    cartStore.addEventToCart(event.value);
  }
}

function openDirections(mode) {
  if (!event.value?.location?.point) return;
  
  // Get destination coordinates
  const { lat, lng } = event.value.location.point;
  
  // Construct Google Maps directions URL
  const baseUrl = 'https://www.google.com/maps/dir/?api=1';
  const destination = `${lat},${lng}`;
  const transportMode = mode;
  
  // Open in new tab
  window.open(`${baseUrl}&destination=${destination}&travelmode=${transportMode}`, '_blank');
}
</script>

<style scoped>
/* General Styling */

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
    height: 40vh; /* Full viewport height */
  }

  .background-layer {
    display:none
  }
  .poster-img {
    height: 40vh;
  }
}

.card.light {
  background-color: whitesmoke;
  border-radius: 10px;
  box-shadow: 7px 2px 10px #b7765c;
}
.card.dark {
  background-color: black;
  border-radius: 10px;
  box-shadow: 7px 2px 10px #b7765c;
}

.lighttext {
  color: white;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* High z-index to appear on top */
}

/* Modal Content Styling */
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  width: 50%;
  max-width: 500px;
  position: relative;
  text-align: center;
}

/* Responsive Modal Width */
@media (max-width: 768px) {
  .modal-content {
    width: 90%; /* Full width for smaller screens */
  }
}

/* Close Button Styling */
.modal-content .btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  color: #666;
  margin-right: 10px;
}

.modal-content .btn-close:hover {
  color: #333;
}

/* Modal Actions */
.modal-actions button {
  margin-top: 10px;
}

.login-btn {
  color: white;
  background-color: #b7765c;
}

/* Map Section */
.location-map {
  margin-top: 1.5rem;
  margin: auto;
}

#map {
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

/* Animations */
/* @keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
*/
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

 .back {
  margin: 1em auto;
  font-family: "Roboto";
  height: 100vh;
}
.back span {
  font-size: 3em;
  color: #ffd5b4;
  background: #262b37;
  display: table-cell;
  box-shadow: inset 0 0 5px rgba(38, 38, 38, 0.3), 0 5px 0 #000000;
  padding: 0 15px;
  line-height: 100px;
  animation: jumb 2s infinite;
  border-radius: 10px;
}
@keyframes jumb {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
    box-shadow: 0 15px 0 rgb(92, 44, 0);
  }
  100% {
    transform: translateY(0px);
  }
}
.back span:nth-child(1) {
  animation-delay: 0s;
}
.back span:nth-child(2) {
  animation-delay: 0.1s;
}
.back span:nth-child(3) {
  animation-delay: 0.2s;
}
.back span:nth-child(4) {
  animation-delay: 0.3s;
}
.back span:nth-child(5) {
  animation-delay: 0.4s;
}
.back span:nth-child(6) {
  animation-delay: 0.5s;
}
.back span:nth-child(7) {
  animation-delay: 0.6s;
}
.back span:nth-child(8) {
  animation-delay: 0.7s;
}

.how-to-get-there {
  margin-top: 2rem;
  text-align: center;
}

.transport-options {
  padding: 1rem 0;
}

.transport-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #2c685e;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.transport-option:hover {
  transform: translateY(-2px);
}

.transport-icon {
  width: 48px;
  height: 48px;
  background-color: #e8f5f3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.transport-icon i {
  font-size: 1.5rem;
}

.dark .transport-option {
  color: #4fd1ba;
}

.dark .transport-icon {
  background-color: #1a3d37;
}
</style>