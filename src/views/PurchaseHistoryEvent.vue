<template>
  <!-- Wrap the entire content in a transition -->
  <transition name="fade" mode="out-in">
    <div v-if="event" id="app">
      <!-- Main Event Details Section -->
      <div class="event-details">
        <!-- Poster and Event Info Section -->
        <div class="poster-section">
          <img :src="event?.imageUrl" class="poster-img" alt="Event Poster" @error="handleImageError" />

          <!-- Event Description Section -->
          <div class="event-info">
            <h1 class="event-title"><strong>{{ event.eventName }}</strong></h1>

            <div class="d-block justify-content-center gap-5 text-muted">
              <!-- Ticket ID with Icon -->
              <p class="h5">
                <i class="fas fa-ticket-alt"></i>     {{ orderId }}
              </p>

              <!-- Event Date with Icon -->
              <p class="h5">
                <i class="fas fa-calendar-alt"></i>   {{ formattedDate }}
              </p>

              <!-- Seat Number with Icon -->
              <p class="h5">
                <i class="fas fa-chair"></i>     {{ event.seat.join(', ') }}
              </p>
            </div>

            <!-- Show QR Code Button -->
            <button class="show-qr-btn animate-pulse" @click="getTicket">Show QR Code</button>
          </div>
        </div>
      </div>
      <!-- Digital Ticket Modal -->
    <transition name="fade">
      <div v-if="showTicket" class="modal-overlay" @click.self="showTicket = false">
        <div class="digital-ticket">
          <div class="ticket-header">
            <button class="close-btn" @click="showTicket = false">×</button>
            <h3 class="ticket-title">TickeTree</h3>
          </div>
          <div class="ticket-content">
            <h1 class="standard-ticket">{{ event?.eventName }}</h1>
            <div class="seat-info">
              <div class="seat-detail">
                <span class="label">SEC</span><br />
                <span class="value">{{ event.ticket.section }}</span>
              </div>
              <div class="seat-detail">
                <span class="label">ROW</span><br />
                <span class="value">{{ event.ticket.row }}</span>
              </div>
            </div>
            <br />
            <p v-if="message" class="unavailable-message">{{ message }}</p>
            <template v-else-if="qrCode">
              <img :src="qrCode" alt="QR Code" class="qr-code" />
              <p class="expiration-message">
                This ticket refreshes every 10 minutes for security
              </p>
            </template>
          </div>
        </div>
      </div>
    </transition>
    </div>

  <!-- Loading message when event is not available -->
  <div v-else>
    <p class="loading-message">Loading event details...</p>
  </div>
  </transition>
</template>


<script setup>
import { ref, computed, onMounted, defineProps, onUnmounted } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import QRCode from 'qrcode';

const props = defineProps(['orderID']);
const event = ref(null);
const showTicket = ref(false);
const qrCode = ref(null);
const message = ref('');
const orderId = ref(props.orderID);
let qrInterval = null;

function generateRandomKey() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

onMounted(() => {
  const auth = getAuth();
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await fetchEventDetails();
    } else {
      console.log('User not authenticated, retrying...');
    }
  });
});

onUnmounted(() => {
  if (qrInterval) {
    clearInterval(qrInterval);
  }
});

async function fetchEventDetails() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) return;

    const paymentCollectionRef = collection(db, 'payment');
    const orderIdQuery = query(paymentCollectionRef, where('orderId', '==', props.orderID));
    const orderIdSnapshot = await getDocs(orderIdQuery);

    if (!orderIdSnapshot.empty) {
      const doc = orderIdSnapshot.docs[0];
      const eventData = doc.data();

      event.value = {
        id: doc.id,
        eventName: eventData.eventName,
        date: eventData.eventDate,
        time: eventData.eventTime,
        location: eventData.eventLocation,
        imageUrl: eventData.imageUrl || '/images/noimage.png',
        seat: eventData.seatNumbers || [],
        ticket: eventData.ticket || { section: '151', row: '15' },
      };
    } else {
      console.error('No matching document found for the order ID:', props.orderID);
    }
  } catch (error) {
    console.error('Error fetching event details: ', error);
  }
}

const formattedDate = computed(() => {
  if (!event.value || !event.value.date) return '';
  const dateRange = event.value.date.split('-');

  if (dateRange.length === 2) {
    const startDate = dateRange[0].trim();
    const endDate = dateRange[1].trim();
    return `${startDate} - ${endDate}`;
  }

  return event.value.date;
});

async function generateQRCode() {
  const currentDate = new Date();
  let qrCodeAvailableDate;

  if (event.value.date.includes('-')) {
    const startDateStr = event.value.date.split('-')[0].trim();
    qrCodeAvailableDate = new Date(startDateStr + ' ' + new Date().getFullYear());
  } else {
    qrCodeAvailableDate = new Date(event.value.date + ' ' + new Date().getFullYear());
  }

  if (currentDate >= qrCodeAvailableDate) {
    try {
      await updateQRCode();
      qrInterval = setInterval(updateQRCode, 600000); 
    } catch (err) {
      console.error(err);
    }
  } else {
    message.value = `QR code will only be available on ${qrCodeAvailableDate.toDateString()}.`;
    qrCode.value = null;
  }
}

async function updateQRCode() {
  const qrData = {
    eventName: event.value.eventName,
    date: event.value.date,
    location: event.value.location,
    orderId: props.orderID,
    timestamp: Date.now(),
    randomKey: generateRandomKey(),
  };

  try {
    qrCode.value = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      errorCorrectionLevel: 'H'
    });
    message.value = '';
  } catch (err) {
    console.error('Error generating QR code:', err);
    message.value = 'Error generating QR code. Please try again.';
  }
}

function handleImageError(event) {
  event.target.src = '/images/noimage.png';
}

function getTicket() {
  showTicket.value = true;
  generateQRCode();
}
</script>

<style scoped>
/* General Styles */

/* Transition Fade-In */
/* Fade-in transition for the entire app */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-out;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}


.fade-enter-active #app {
  transform: scale(1);
}

body, html {
  height: 100%;
  margin: 0;
}

#app {
  transform: scale(0.98);
  transition: transform 0.5s ease-out;
  font-family: 'Arial', sans-serif;
  color: #333;
  margin: 0;
  padding: 0;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
}

footer {
  margin-top: auto; /* Pushes the footer to the bottom */
}

/* Event Details Container */
.event-details {
  display: flex;
  justify-content: center;
  padding: 50px;
}

/* Poster Section */
.poster-section {
  display: flex;
  flex-direction: row;
  gap: 20px;
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  width: 80%;
  max-width: 900px;
}

/* Responsive Layout Adjustments */
@media (max-width: 768px) { /* Medium devices */
  .poster-section {
    flex-direction: column;
    align-items: center;
    width: 90%;
  }
  
  .poster-img {
    width: 70%;
    margin-bottom: 20px;
  }

  .event-title {
    font-size: 24px;
    text-align: center;
  }
}

@media (max-width: 576px) { /* Small devices */
  .poster-section {
    width: 100%;
    padding: 16px;
  }
  
  .poster-img {
    width: 100%;
  }

  .event-title {
    font-size: 22px;
  }
  
  .event-details-item {
    font-size: 16px;
  }
}

@media (max-width: 400px) { /* Extra small devices */
  .poster-section {
    width: 100%;
    padding: 12px;
  }

  .event-info {
    gap: 10px;
  }

  .event-title {
    font-size: 20px;
    text-align: center;
  }

  .show-qr-btn {
    font-size: 16px;
    padding: 6px 10px;
  }

  .event-details-item {
    font-size: 14px;
  }

  .event-details-item i {
    font-size: 18px;
  }
}

.text-muted {
  font-size: 0.8em;
  color: #6c757d !important;
}

.event-info .d-block {
  display: block;
  justify-content: center;
  gap: 15px;  /* Increase the gap between each icon/description pair */
}

.event-info .d-block p {
  margin-bottom: 15px;  /* Add margin between each <p> tag */
}

.event-info .d-block i {
  margin-right: 8px;  /* Increase the space between icon and text */
}

/* Iconized Information Styling */
.event-details-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #555;
  line-height: 1.5;
}

.event-details-item i {
  font-size: 20px;
  color: #8c5a53;
  line-height: 1.5;
  margin-top: 2px;
}

/* Image Styling */
.poster-img {
  width: 45%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Event Info Section */
.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

/* Event Title */
.event-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* Button */
.show-qr-btn {
  align-self: flex-start;
  background-color: #2c685e !important;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s;
}

.show-qr-btn:hover {
  background-color: #7a5046;
}

.animate-pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.digital-ticket {
  width: 100%;
  max-width: 380px;
  background-color: #0a0a0a;
  border-radius: 20px;
  overflow: hidden;
  color: white;
}

.ticket-header {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #2a2a2a;
  position: relative;
}

.close-btn {
  position: absolute;
  left: 16px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.ticket-title {
  width: 100%;
  text-align: center;
  font-size: 20px;
  margin: 0;
}

.ticket-content {
  padding: 24px;
}

.standard-ticket {
  text-align: center;
  font-size: 25px;
  margin-bottom: 24px;
}

.seat-info {
  display: flex;
  justify-content: space-between;
  padding-left: 60px;
  padding-right: 60px;
}

.seat-detail {
  text-align: center;
}

.label {
  font-weight: bold;
}

.qr-code {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}

.loading-message {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-top: 50px;
}

.expiration-message {
  text-align: center;
  color: #ad3939;
  font-size: 14px;
  margin-top: 16px;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.unavailable-message {
  text-align: center;
  color: #ad3939;
  font-size: 14px;
  margin-top: 16px;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>
