<template>
  <div class="container mt-3 d-flex justify-content-between">
    <div class="price-section">
      <h4>Price: ${{ event.price?.toFixed(2) }}</h4>
      <button class="btn btn-primary" @click="showTicket = true">
        View Ticket
      </button>
    </div>
    <div class="marketplace">
      <h5>Marketplace</h5>
      <button class="btn btn-outline-primary">See Resale Price</button>
    </div>
  </div>

  <!-- Digital Ticket Modal -->
  <transition name="fade">
    <div
      v-if="showTicket"
      class="modal-overlay"
      @click.self="showTicket = false"
    >
      <div class="digital-ticket">
        <!-- Header with close button -->
        <div class="ticket-header">
          <button class="close-btn" @click="showTicket = false">×</button>
          <h3 class="ticket-title">Ticketmaster Events</h3>
        </div>

        <!-- Ticket Content -->
        <div class="ticket-content">
          <h1 class="standard-ticket">{{ event.eventName }}</h1>

          <!-- Seat Information -->
          <div class="seat-info">
            <div class="seat-detail">
              <span class="label">SEC</span>
              <span class="value">{{ ticket.section }}</span>
            </div>
            <div class="seat-detail">
              <span class="label">ROW</span>
              <span class="value">{{ ticket.row }}</span>
            </div>
            <div class="seat-detail">
              <span class="label">SEAT</span>
              <span class="value">{{ ticket.seat }}</span>
            </div>
          </div>

          <!-- QR Code -->
          <p v-if="message" class="unavailable-message">{{ message }}</p>
          <img v-else-if="qrCode" :src="qrCode" alt="QR Code" class="qr-code" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import QRCode from "qrcode";

export default {
  name: "PriceMarketplaceSection",
  props: {
    event: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showTicket: false,
      qrCode: null,
      qrCodeAvailableDate: new Date("2024-11-03"),
      message: "",
    };
  },
  computed: {
    ticket() {
      return (
        this.event.ticket || {
          section: "151",
          row: "15",
          seat: "15",
        }
      );
    },
  },
  watch: {
    showTicket(val) {
      if (val && !this.qrCode) {
        this.generateQRCode();
      }
    },
  },
  methods: {
    async generateQRCode() {
      const currentDate = new Date();
      if (currentDate >= this.qrCodeAvailableDate) {
        try {
          this.qrCode = await QRCode.toDataURL("https://example.com", {
            width: this.qrCodeSize,
          });
          this.message = ""; // Reset message if QR code is available
          console.log("QR code displayed");
        } catch (err) {
          console.error(err);
        }
      } else {
        this.message = "QR code will only be available on November 3, 2024.";
        this.qrCode = null; // Ensure QR code is not displayed
      }
    },
  },
};
</script>


<style scoped>
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
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
  font-size: 16px;
  margin: 0;
}

.ticket-content {
  padding: 24px;
}

.standard-ticket {
  text-align: center;
  font-size: 30px;
  margin-bottom: 24px;
}

.seat-info {
  display: flex;
  justify-content: space-between;
  padding-left: 60px;
  padding-right: 60px;
}

.seat-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.value {
  font-size: 24px;
  font-weight: bold;
}

/* QR Code Styling */
.qr-code {
  width: 200px;
  height: 200px;
  display: block;
  margin: 24px auto;
  border-radius: 8px;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.unavailable-message {
  text-align: center;
  margin-top: 20px;
}
</style>
