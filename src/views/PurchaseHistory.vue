<template>
  <h1 class="ml1">
    <span class="text-wrapper">
      <span class="line line1"></span>
      <span class="letters">Purchase History</span>
      <span class="line line2"></span>
    </span>
  </h1>
  <!-- Loading Message -->
  <span
    v-if="loading"
    class="back d-flex align-items-center justify-content-center"
  >
    <span>L</span><span>o</span><span>a</span><span>d</span><span>i</span
    ><span>n</span><span>g</span>
  </span>

  <!-- Events List -->
  <div v-else class="events-list container">
    <div class="container mt-4 purchase-history-section">
      <!-- Nav Pills for Upcoming and Past Events -->
      <ul class="nav nav-pills justify-content-center mb-4">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentTab === 'upcoming' }"
            @click.prevent="setTab('upcoming')"
            href="#1"
            data-toggle="tab"
          >
            Upcoming Events
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentTab === 'past' }"
            @click.prevent="setTab('past')"
            data-toggle="tab"
            href="#2"
          >
            Past Events
          </a>
        </li>
      </ul>

      <p v-if="filteredTickets.length === 0" class="no-tickets-message">
        No tickets available
      </p>

      <div v-for="ticket in filteredTickets" :key="ticket.id" class="purchase-item-container">
        <router-link
          :to="{ name: 'PurchaseHistoryEvent', params: { orderID: ticket.id } }"
          class="purchase-item-link"
        >
          <div class="purchase-item row justify-content-center">
            <div class="event-image-container">
              <img
                :src="ticket.imageUrl"
                alt="Event Image"
                class="event-image"
                loading="lazy"
                @error="handleImageError"
              />
            </div>
            <div class="event-details col col-12 col-md-auto">
              <h2 class="text-center text-md-start">{{ ticket.eventName }}</h2>
              <p class="date text-center text-md-start">
                Date:
                <span v-if="ticket.endDate">
                  {{ formatDate(ticket.startDate) }} -
                  {{ formatDate(ticket.endDate) }}
                </span>
                <span v-else>
                  {{ formatDate(ticket.startDate) }}
                </span>
              </p>
              <p class="seat text-center text-md-start">
                Seat: {{ ticket.seatNumbers.join(", ") }}
              </p>
            </div>
            <div class="event-price col col-12 col-md-auto">
              <span class="price">${{ ticket.price }}</span>
              <span class="badge-status paid w-100 w-md-25">Paid</span>
            </div>
          </div>
        </router-link>

        <!-- List for Sale Section -->
        <div v-if="currentTab === 'upcoming'" class="list-for-sale-section">
  <button 
    v-if="!ticket.listed"  
    @click="toggleListForm(ticket.id)" 
    :disabled="ticket.listed"
    class="list-ticket-btn"
  >
    List for Sale
  </button>

          <!-- Expandable List Form -->
          <div v-if="isListingExpanded[ticket.id]" class="list-form-container">
            <div class="list-form">
              <div class="form-header">
                <h4>List Ticket for Sale</h4>
                <button @click="toggleListForm(ticket.id)" class="close-btn">
                  ×
                </button>
              </div>
              
              <div class="form-content">
                <div class="price-input-group">
                  <label for="sellingPrice">Selling Price ($)</label>
                  <div class="price-field">
                    <span class="currency-symbol">$</span>
                    <input
                      type="number"
                      :id="'sellingPrice-' + ticket.id"
                      v-model="listingPrices[ticket.id]"
                      min="0"
                      step="0.01"
                      placeholder="Enter price"
                      class="price-input"
                    />
                  </div>
                </div>
                
                <div class="suggested-price">
                  <span class="suggestion-label">Suggested Price Range:</span>
                  <span class="suggestion-value">
                    ${{ (ticket.price * 0.8).toFixed(2) }} - ${{ (ticket.price * 1.2).toFixed(2) }}
                  </span>
                </div>

                <div class="form-actions">
                  <button 
                    @click="confirmListing(ticket)" 
                    class="confirm-btn"
                    :disabled="!listingPrices[ticket.id]"
                  >
                    Confirm Listing
                  </button>
                  <button 
                    @click="toggleListForm(ticket.id)" 
                    class="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import anime from "animejs/lib/anime.es.js";
import { ref, computed, onMounted, nextTick } from "vue";
import { collection, getDocs, query, doc, where, addDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";

const currentTab = ref(localStorage.getItem("currentTab") || "upcoming");
const ticketlist = ref([]);
const loading = ref(true);
const isListingExpanded = ref({});
const listingPrices = ref({});

// Function to set the current tab and save it in localStorage
function setTab(tab) {
  currentTab.value = tab;
  localStorage.setItem("currentTab", tab);
}

function toggleListForm(ticketId) {
  isListingExpanded.value = {
    ...isListingExpanded.value,
    [ticketId]: !isListingExpanded.value[ticketId]
  };
  
  // Reset price when closing
  if (!isListingExpanded.value[ticketId]) {
    listingPrices.value[ticketId] = null;
  }
}

async function confirmListing(ticket) {
  const price = listingPrices.value[ticket.id];
  
  if (!price) {
    alert("Please enter a selling price.");
    return;
  }

  try {
    const marketplaceDocRef = doc(collection(db, "ticket"));
    const ticketData = {
      category: "Arts & Culture",
      eventName: ticket.eventName,
      imageUrl: ticket.imageUrl,
      location: ticket.location || "Parkview Museum, Bugis, Singapore",
      price: parseFloat(price),
      seatNumber: ticket.seatNumbers[0],
      userId: ticket.userId,
      listed: true,
    };

    // Format and store the date as a single string
    if (ticket.startDate && ticket.endDate) {
      ticketData.date = `${formatDate(ticket.startDate)} - ${formatDate(ticket.endDate)}`;
    } else {
      // If only start date is available, use it as the event date
      ticketData.date = formatDate(ticket.startDate);
    }

    const docRef = await setDoc(marketplaceDocRef, ticketData);

    // Close form and reset price
    ticket.listed = true;
    toggleListForm(ticket.id);
    alert("Ticket successfully listed for sale!");
  } catch (error) {
    console.error("Error listing ticket: ", error);
    alert("Failed to list ticket. Please try again.");
  }
}



function initializeAnimation() {
  const textWrapper = document.querySelector('.ml1 .letters');
  if (textWrapper) {
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

    anime.timeline()
      .add({
        targets: '.ml1 .letter',
        scale: [0.3,1],
        opacity: [0,1],
        translateZ: 0,
        easing: "easeOutExpo",
        duration: 600,
        delay: (el, i) => 70 * (i+1)
      }).add({
        targets: '.ml1 .line',
        scaleX: [0,1],
        opacity: [0.5,1],
        easing: "easeOutExpo",
        duration: 700,
        offset: '-=875',
        delay: (el, i, l) => 80 * (l - i)
      });
  }
}

onMounted(async() => {
  await nextTick();
  initializeAnimation();
  const auth = getAuth();

  auth.onAuthStateChanged((user) => {
    if (user) {
      fetchTickets().then(() => {
        const purchaseItems = document.querySelectorAll(".purchase-item");
        if (purchaseItems.length > 0) {
          anime({
            targets: ".purchase-item",
            translateY: [100, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: "easeOutExpo",
            delay: anime.stagger(100),
          });
        }
      });
    }
  });
});

async function fetchTickets() {
  loading.value = true;
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.uid) return;

    const paymentCollectionRef = collection(db, "payment");
    const userTicketsQuery = query(
      paymentCollectionRef,
      where("userId", "==", currentUser.uid)
    );

    const querySnapshot = await getDocs(userTicketsQuery);

    ticketlist.value = querySnapshot.docs.map((doc) => {
      const eventData = doc.data();
      const [startDate, endDate] = parseEventDate(eventData.eventDate);

      return {
        id: doc.id,
        eventName: eventData.eventName,
        startDate,
        endDate,
        seatNumbers: eventData.seatNumbers || [],
        price: eventData.totalPrice,
        quantity: eventData.quantity,
        imageUrl: eventData.imageUrl || "/images/noimage.png",
        userId: eventData.userId,
        listed: eventData.listed || false,
      };
    });
  } catch (error) {
    console.error("Error fetching tickets: ", error);
  } finally {
    loading.value = false;
  }
}

function parseEventDate(eventDate) {
  if (eventDate.includes(" - ")) {
    const dateParts = eventDate.split(" - ");
    const start = new Date(`${dateParts[0]} ${new Date().getFullYear()}`);
    const end = new Date(`${dateParts[1]} ${new Date().getFullYear()}`);

    if (end < start) {
      end.setFullYear(end.getFullYear() + 1);
    }

    return [start, end];
  } else {
    const singleDate = new Date(`${eventDate} ${new Date().getFullYear()}`);
    return [singleDate, null];
  }
}

const filteredTickets = computed(() => {
  const currentDate = new Date();
  return ticketlist.value.filter((ticket) => {
    if (currentTab.value === "upcoming") {
      return ticket.endDate
        ? ticket.endDate >= currentDate
        : ticket.startDate >= currentDate;
    } else {
      return ticket.endDate
        ? ticket.endDate < currentDate
        : ticket.startDate < currentDate;
    }
  });
});

function handleImageError(event) {
  event.target.src = "/images/noimage.png";
}

function formatDate(date) {
  if (date instanceof Date) {
    const dayOfWeek = date.toLocaleDateString("en-GB", { weekday: "short" });
    const day = date.toLocaleDateString("en-GB", { day: "numeric" });
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    
    return `${dayOfWeek} ${day} ${month}`;
  }
  return date;
}

</script>

<style scoped>
.purchase-history-section {
  padding: 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.nav-pills .nav-link {
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #b7765c;
}

.nav-pills .nav-link.active {
  background-color: #b7765c;
  color: white;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.purchase-item-container {
  margin-bottom: 20px;
}

.purchase-item {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 100%;
  gap: 16px;
  box-shadow: 7px 2px 10px #b7765c;
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
  color: black;
}

.date,
.seat {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
  margin-bottom: 5px;
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
  color: black;
}

.badge-status {
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: green;
  color: #fff;
  text-align: center;
}

.purchase-item-link {
  text-decoration: none;
}

/* List for Sale Section */
.list-for-sale-section {
  margin-top: 10px;
  align-items: center;
}

.list-ticket-btn {
  width: 100%;
  padding: 12px;
  background-color: #ffd5b4;
  border: none;
  border-radius: 8px;
  color: #262b37;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 0 #b7765c;
  margin-left: -10px;
}

.list-ticket-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 #b7765c;
}

.list-ticket-btn:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #b7765c;
}

.list-form-container {
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  box-shadow: 7px 2px 10px #b7765c;
  margin-left: -10px;
}

.list-form {
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h4 {
  margin: 0;
  color: #262b37;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #262b37;
  cursor: pointer;
  padding: 0 5px;
}

.price-input-group {
  margin-bottom: 20px;
}

.price-input-group label {
  display: block;
  margin-bottom: 8px;
  color: #262b37;
  font-weight: 500;
}

.price-field {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  color: #262b37;
}

.price-input {
  width: 100%;
  padding: 10px 10px 10px 25px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  transition: all 0.3s ease;
}

.price-input:focus {
  outline: none;
  border-color: #b7765c;
  box-shadow: 0 0 0 2px rgba(183, 118, 92, 0.2);
}

.suggested-price {
  background-color: #ffd5b4;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #262b37;
}

.suggestion-label {
  font-weight: 500;
}

.suggestion-value {
  font-weight: 600;
  margin-left: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.confirm-btn, .cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn {
  background-color: #ffd5b4;
  color: #262b37;
  box-shadow: 0 5px 0 #b7765c;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 #b7765c;
}

.confirm-btn:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #b7765c;
}

.confirm-btn:disabled {
  background-color: #ddd;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background-color: #262b37;
  color: #ffd5b4;
  box-shadow: 0 5px 0 #000000;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 #000000;
}

.cancel-btn:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #000000;
}

.listed-status {
  color: #666;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

/* Loading Animation */
html {
  height: 90%;
}

.back {
  margin: 90px 0px 0px 0px;
  font-family: "Roboto";
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

.back span:nth-child(1) { animation-delay: 0s; }
.back span:nth-child(2) { animation-delay: 0.1s; }
.back span:nth-child(3) { animation-delay: 0.2s; }
.back span:nth-child(4) { animation-delay: 0.3s; }
.back span:nth-child(5) { animation-delay: 0.4s; }
.back span:nth-child(6) { animation-delay: 0.5s; }
.back span:nth-child(7) { animation-delay: 0.6s; }

/* Title Animation */
.ml1 {
  font-weight: 900;
  font-size: 3.5em;
  text-align: center;
  margin-top: 20px;
}

.ml1 .letter {
  display: inline-block;
  line-height: 1em;
}

.ml1 .text-wrapper {
  position: relative;
  display: inline-block;
  padding-top: 0.1em;
  padding-right: 0.05em;
  padding-bottom: 0.15em;
}

.ml1 .line {
  opacity: 0;
  position: absolute;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: #fff;
  transform-origin: 0 0;
}

.ml1 .line1 { top: 0; }
.ml1 .line2 { bottom: 0; }

/* Responsive Styles */
@media (max-width: 768px) {
  .purchase-item {
    flex-direction: column;
    text-align: center;
  }
  
  .event-price {
    margin-top: 10px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>