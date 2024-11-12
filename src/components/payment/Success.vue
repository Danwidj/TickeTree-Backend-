<template>
  <div class="success-container">
    <div v-if="isLoading">
      <p>Loading your order summary...</p>
    </div>
    <div v-else-if="orderSummary">
      <div class="svg-overlay">
        <svg width="100%" height="100" viewBox="0 0 300 100">
          <path
            id="flightPath"
            d="m39,348c1,0 19.00613,0.56482 45,0c23.0163,-0.50012 37.63463,-3.79041 48,-10c18.35866,-10.99817 30.90819,-26.06519 43,-43c12.9024,-18.07007 23.12024,-34.62286 27,-48c2.84067,-9.7944 4.18579,-21.77023 -1,-33c-3.60649,-7.80981 -8,-10 -11,-10c-5,0 -11.22273,0.724 -15,4c-3.20512,2.77979 -6,7 -9,11c-3,4 -5,8 -5,11c0,3 -0.91553,4.14313 0,7c2.62523,8.19196 7.70546,12.34619 10,14c3.62799,2.6149 9.76471,5.57809 19,9c9.78989,3.62738 23.57077,8.87628 45,0c32.30551,-35.55295 64.9147,-71.80737 115,-138c35.24564,-46.58054 55,-68 60,-74l0,0"
            fill="none"
          />
        </svg>
      </div>
      <div class="success-header">
        <div ref="paperPlane" class="paper-plane">
          <img
            src="/images/paperplane.svg"
            alt="Paper Plane"
            width="40"
            height="40"
          />
        </div>
        <div class="success-icon-text mt-2">
          <span class="success-icon">✔</span>
          <h1>Payment Confirmed</h1>
        </div>
        <p class="success-message">
          Thank you, your payment has been successful, and your purchase is now
          confirmed. A confirmation email has been sent to
          {{ orderSummary.customerEmail }}.
        </p>
      </div>
      <div class="order-summary">
        <h2>Order Summary</h2>
        <div class="order-info">
          <div class="order-detail">
            <p class="order-label">Event:</p>
            <p class="order-value">{{ orderSummary.eventName }}</p>
          </div>
          <div class="order-detail">
            <p class="order-label">Date:</p>
            <p class="order-value">{{ orderSummary.eventDate }}</p>
          </div>
          <div
            class="order-detail"
            v-if="orderSummary.seatNumbers && orderSummary.seatNumbers.length"
          >
            <p class="order-label">Seats:</p>
            <p class="order-value">
              <span
                v-for="(seat, index) in orderSummary.seatNumbers"
                :key="index"
              >
                {{ seat
                }}<span v-if="index < orderSummary.seatNumbers.length - 1"
                  >,
                </span>
              </span>
            </p>
          </div>
          <div class="order-detail">
            <p class="order-label">Quantity:</p>
            <p class="order-value">{{ orderSummary.quantity }}</p>
          </div>
          <div class="order-detail">
            <p class="order-label">Total Price:</p>
            <p class="order-value">
              SGD {{ (orderSummary.totalPrice / 100).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
      <div class="order-summary-card">
        <button class="return-btn" @click="redirectToHomepage">
          Return to Homepage
        </button>
      </div>
    </div>
    <div v-else>
      <p>Failed to load order details. Please try again later.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useCartStore } from "@/stores/cartStore";
import anime from "animejs";

export default {
  data() {
    return {
      sessionId: "",
      orderSummary: {},
      isLoading: true,
    };
  },
  async created() {
    this.sessionId = this.$route.query.session_id;

    const savedOrderSummary = localStorage.getItem(
      `orderSummary_${this.sessionId}`
    );
    if (savedOrderSummary) {
      this.orderSummary = JSON.parse(savedOrderSummary);
      this.isLoading = false;
      return;
    }

    if (this.sessionId) {
      try {
        const response = await axios.get(
          `https://wad2-project-g5t7-2024-backend.vercel.app/api/checkout-session`,
          {
            params: { session_id: this.sessionId },
          }
        );

        const session = response.data;

        if (session.line_items && session.line_items.data.length > 0) {
          const item = session.line_items.data[0];

          this.orderSummary = {
            eventName: item.price.product.name,
            eventDate: item.price.product.metadata.eventDate || "N/A",
            seatNumbers: item.price.product.metadata.seatNumbers
              ? JSON.parse(item.price.product.metadata.seatNumbers)
              : ["N/A"],
            quantity: item.quantity,
            customerEmail: session.customer_email || "N/A",
            totalPrice: session.amount_total,
            imageUrl:
              item.price.product.metadata.imageUrl || "/images/noimage.png",
          };

          await this.savePaymentDetails();
          localStorage.setItem(
            `orderSummary_${this.sessionId}`,
            JSON.stringify(this.orderSummary)
          );
          this.deletePurchasedTickets();
        } else {
          console.error("No line items found in the session data.");
        }
      } catch (error) {
        console.error("Failed to fetch session details:", error);
      } finally {
        this.isLoading = false;
      }
    }
  },
  watch: {
    isLoading(value) {
      if (!value && this.orderSummary) {
        this.$nextTick(() => {
          const flightPath = anime.path("#flightPath");
          anime({
            targets: this.$refs.paperPlane,
            translateX: flightPath("x"),
            translateY: flightPath("y"),
            easing: "easeInOutQuad",
            duration: 5000,
            loop: false,
          });
        });
      }
    },
  },
  methods: {
    async savePaymentDetails() {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const userId = currentUser ? currentUser.uid : null;

        const paymentData = {
          customerEmail: this.orderSummary.customerEmail,
          eventName: this.orderSummary.eventName,
          seatNumbers: this.orderSummary.seatNumbers,
          quantity: this.orderSummary.quantity,
          eventDate: this.orderSummary.eventDate,
          totalPrice: Math.round(this.orderSummary.totalPrice / 100),
          imageUrl: this.orderSummary.imageUrl,
          userId: userId,
        };

        const docRef = await addDoc(collection(db, "payment"), paymentData);
        await updateDoc(docRef, { orderId: docRef.id });
      } catch (error) {
        console.error("Error adding payment document: ", error);
      }
    },

    async deletePurchasedTickets() {
      const cartStore = useCartStore();
      for (const item of cartStore.cartItems) {
        try {
          const ticketDocRef = doc(db, "ticket", String(item.id));

          const ticketSnapshot = await getDoc(ticketDocRef);
          if (!ticketSnapshot.exists()) {
            continue;
          }

          const ticketData = ticketSnapshot.data();
          const ticketUserId = ticketData.userId;

          await deleteDoc(ticketDocRef);

          const paymentQuery = query(
            collection(db, "payment"),
            where("userId", "==", ticketUserId),
            where("eventName", "==", item.eventName)
          );

          const querySnapshot = await getDocs(paymentQuery);
          querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        } catch (error) {
          console.error("Error deleting ticket document: ", error);
        }
      }
      cartStore.clearCart();
    },

    redirectToHomepage() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.success-container {
  padding: 30px;
  max-width: 600px;
  margin: 30px auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  text-align: center;
  position: relative;
}

.svg-overlay {
  position: absolute;
  top: -10px;
  left: -500px;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.paper-plane {
  position: absolute;
  top: -40px;
  left: -525px;
  z-index: auto;
}

body,
html {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-header {
  text-align: center;
}

.success-icon-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.success-icon {
  font-size: 40px;
  color: #4caf50;
  margin-right: 10px;
}

h1 {
  font-size: 24px;
  color: #4caf50;
  margin: 0;
  font-weight: bold;
}

.success-message {
  font-size: 16px;
  color: #333;
  margin-top: 10px;
  line-height: 1.5;
}

.order-summary {
  margin-top: 20px;
}

h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
}

.order-info {
  font-size: 16px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.order-detail {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}

.order-detail:last-child {
  border-bottom: none;
}

.order-label {
  font-weight: bold;
  color: #666;
}

.order-value {
  color: #333;
}

.event-image {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}

.order-summary-card {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.return-btn {
  display: inline-block;
  background-color: #2c685e !important;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.return-btn:hover {
  background-color: #388e3c;
}
</style>
