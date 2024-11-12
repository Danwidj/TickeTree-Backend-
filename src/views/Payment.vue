<template>
<div class="payment-confirmation-container">
    <div class="discard-mode-toggle" @click="toggleDiscardMode">
      <i :class="['fas', 'fa-trash', discardMode ? 'active' : '']"></i>
    </div>

    <!-- Trash Bin Area for Drag and Drop -->
    <div
      v-if="discardMode"
      class="trash-bin"
      @dragover.prevent
      @drop="handleDrop"
    >
      Drop here to delete
    </div>
  <div class="shopping-cart" :class="{ 'discard-mode-active': discardMode }">
    <div class="title">Payment Confirmation</div>
    <div v-if="cartItems.length === 0" class="empty-cart-message">
      <p>No items added in the cart</p>
    </div>
    <div v-else>
      <div v-for="(item, index) in cartItems" :key="index" class="item" draggable="true"
          @dragstart="startDrag(index)"
          :class="{ 'discard-mode': discardMode }">
        <div class="image">
          <img :src="item.imageUrl" width="150px" height="100px" alt="Event Image" />
        </div>
        <div class="description">
          <span style="font-weight: bold; font-size: 18px">{{ item.eventName }}</span>
          <span>Seats: {{ formatSeatNumbers(item) }}</span>
          <span>Date: {{ formatDate(item.eventDate) }}</span>
        </div>
        <div class="quantity">
          <template v-if="item.source !== 'firebase'">
            <button class="minus-btn" type="button" @click="decreaseQuantity(index)">
              <img src="/images/minus.svg" alt="Decrease Quantity" />
            </button>
            <input type="text" v-model="item.quantity" @change="updateCart()" />
            <button class="plus-btn" type="button" @click="increaseQuantity(index)">
              <img src="/images/plus.svg" alt="Increase Quantity" />
            </button>
          </template>
          <template v-else>
            <input type="text" v-model="item.quantity" disabled />
          </template>
        </div>
        <div class="total-price">${{ (item.quantity * item.pricePerItem).toFixed(2) }}</div>
      </div>
      <div class="checkout-button-container">
        <button class="checkout-btn" @click="checkout">Proceed to Payment</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';
import { useCartStore } from "@/stores/cartStore";
import { computed, ref } from "vue";

export default {
  setup() {
    const cartStore = useCartStore();
    const cartItems = computed(() => cartStore.cartItems);
    const discardMode = ref(false);
    const draggedItemIndex = ref(null);

    const toggleDiscardMode = () => {
      discardMode.value = !discardMode.value;
    };

    const startDrag = (index) => {
      draggedItemIndex.value = index;
    };

    const handleDrop = () => {
      if (draggedItemIndex.value !== null) {
        cartStore.deleteItem(draggedItemIndex.value);
        draggedItemIndex.value = null;
      }
    };


    const deleteItem = (index) => {
      cartStore.deleteItem(index);
    };

    const increaseQuantity = (index) => {
      cartStore.cartItems[index].quantity += 1;

    };

    const decreaseQuantity = (index) => {
      if (cartStore.cartItems[index].quantity > 1) {
        cartStore.cartItems[index].quantity -= 1;
      } else {
        deleteItem(index);
      }
    };

    return { cartItems, deleteItem, increaseQuantity, decreaseQuantity, toggleDiscardMode, startDrag, handleDrop, discardMode};
  },
  async mounted() {
    this.stripe = await loadStripe('pk_test_51QAsReGgLeDXJUjvDrRwiHI6nisUuA7gSQw3AlX2UBqzlc4vPhbGCQCjcNiDel8pBfks9UhZGZXlO0jkvuNx1roP00zHKPl3aR');
  },
  methods: {
    formatSeatNumbers(item) {
      const baseSeat = item.seatNumber;
      return Array.from({ length: item.quantity }, (_, i) => baseSeat + i).join(', ');
    },
       async checkout() {
  try {
    // Mark items as purchased before sending to backend
    const items = this.cartItems.map(item => {
      item.purchased = true; // Set purchased flag
      return {
        eventName: item.eventName,
        seatNumbers: Array.from({ length: item.quantity }, (_, i) => item.seatNumber + i),
        eventDate: item.eventDate,
        pricePerItem: item.pricePerItem,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      };
    });

    localStorage.setItem('orderSummary', JSON.stringify(items));

    // Continue with checkout process
    const response = await fetch('http://localhost:5001/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems: items }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error}`);
    }

    const session = await response.json();
    const { error } = await this.stripe.redirectToCheckout({ sessionId: session.id });

    if (error) {
      console.error("Error redirecting to checkout:", error);
    } else {
      // Remove purchased items from cart after checkout
      cartStore.cartItems = cartStore.cartItems.filter(item => !item.purchased);
      localStorage.setItem('cartItems', JSON.stringify(cartStore.cartItems)); // Update localStorage
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
  }
},
   formatDate(dateStr) {
  if (!dateStr) return "Date not available";

  const dates = dateStr.split(" - ");
  const formattedDates = dates.map((date) => {
    const parts = date.trim().split(" ");
    
    if (parts.length < 3) {
      return "Invalid date format"; // handle unexpected formats
    }

    const [dayOfWeek, day, month] = parts;
    return `${dayOfWeek} ${day} ${month}`;
  });

  return formattedDates.join(" - ");
},

  },
};
</script>

<style scoped>

.payment-confirmation-container {
  padding: 20px;
  margin: 20px auto;
  position: relative;
  width: 100%;
}

.discard-mode-toggle {
  position: absolute;
  top: 45px;
  left: 200px;
  width: 50px;
  height: 50px;
  font-size: 28px;
  background-color: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1315px) {
  .discard-mode-toggle {
    right: auto;
    left: 20px;
    top: -20px;
  }
}

@media (max-width: 576px) {
  .payment-confirmation-container {
    padding: 30px 10px 20px;
  }

  .discard-mode-toggle {
    width: 35px;
    height: 35px;
    font-size: 18px;
    top: -15px;
    left: 10px;
  }

  .trash-bin {
    margin-top: 30px;
  }
}

.discard-mode-toggle:hover {
  background-color: #ffebee;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.discard-mode-toggle .fas.fa-trash {
  color: #000000;
  transition: color 0.3s ease;
}

.discard-mode-toggle .fas.fa-trash.active {
  color: #d32f2f;
}

.trash-bin {
  width: 100%;
  max-width: 800px;
  height: 60px;
  margin: 20px auto;
  background-color: #ffebee;
  border: 2px dashed #f44336;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d32f2f;
  font-size: 16px;
  font-weight: bold;
}

.shopping-cart.discard-mode-active .item {
  opacity: 0.8;
  cursor: grab;
}

.item.discard-mode {
  border: 2px dashed #f44336;
}

.item.discard-mode-active:active {
  cursor: grabbing;
}

.empty-cart-message {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #5e6977;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  padding: 10px;
  margin: 0;
  background-color: #f5f7fa;
  font-family: 'Roboto', sans-serif;
}

.shopping-cart {
  width: 100%;
  max-width: 800px;
  margin: 50px auto;
  background: #ffffff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title {
  height: 60px;
  border-bottom: 1px solid #e1e8ee;
  padding: 10px;
  color: #333;
  font-size: 20px;
  background-color: #f8f9fa;
  text-align: center;
}

.item {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e1e8ee;
  flex-direction: column;
  width: 100%;
}

.image {
  width: 100%;
  max-width: 150px;
  height: auto;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.description {
  font-size: 16px;
  color: #43484d;
  text-align: center;
  margin-bottom: 10px;
}

.description span {
  display: block;
  margin-bottom: 5px;
}

.quantity {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.quantity button {
  background-color: #e1e8ee;
  border: none;
  border-radius: 6px;
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0 5px;
}

.quantity button img {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0 2px;
}

.quantity input {
  width: 40px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  font-size: 14px;
}

.minus-btn,
.plus-btn {
  background-color: #e1e8ee;
}

.minus-btn:hover,
.plus-btn:hover {
  background-color: #d1d8db;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.checkout-button-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  background-color: #f8f9fa;
}

.checkout-btn {
  width: 220px;
  height: 45px;
  background-color: #2c685e !important;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.checkout-btn:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

/* Responsive Styles */
@media (min-width: 576px) {
  .item {
    flex-direction: row;
    align-items: center;
  }

  .buttons {
    margin-right: 20px;
    margin-bottom: 0;
  }

  .image {
    width: 20%;
    max-width: 150px;
    margin-right: 20px;
  }

  .description {
    flex: 2;
    text-align: left;
    margin-bottom: 0;
  }

  .quantity {
    width: 100px;
    margin-bottom: 0;
    justify-content: center;
  }

  .total-price {
    width: 90px;
    text-align: right;
  }

   .checkout-button-container {
    justify-content: center;
  }

  .checkout-btn {
    width: 80%;
    max-width: 300px;
  }
}

@media (min-width: 768px) {
  .shopping-cart {
    width: 80%;
  }

  .item {
    flex-direction: row;
  }

  .description {
    order: 2;
    text-align: left;
  }

  .quantity {
    order: 3;
    text-align: center;
  }

  .total-price {
    order: 4;
    text-align: right;
  }
}

@media (min-width: 992px) {
  .shopping-cart {
    width: 800px;
  }
   .checkout-button-container {
    justify-content: flex-end;
  }

  .checkout-btn {
    width: 220px;
  }
}


</style>
