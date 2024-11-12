import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([]);

  // Load cart items from localStorage on initialization
  if (localStorage.getItem('cartItems')) {
    cartItems.value = JSON.parse(localStorage.getItem('cartItems'));
  }

  function addEventToCart(event) {
    const itemIndex = cartItems.value.findIndex(
      item => item.id === event.id && item.source === 'api'
    );
    if (itemIndex !== -1) {
      // Check if the item is already purchased
      if (cartItems.value[itemIndex].purchased) {
        return; // Prevent adding already purchased item
      }
      cartItems.value[itemIndex].quantity += 1;
    } else {
      cartItems.value.push({
        category: "Entertainment",
        id: event.id,
        eventName: event.name,
        eventDate: event.datetime_summary,
        eventTime: event.time,
        eventLocation: event.location_summary,
        seatNumber: Math.floor(Math.random() * 100) + 1,
        pricePerItem: event.price || 50.00,
        quantity: 1,
        imageUrl: event.images?.images[0]?.original_url || '/images/noimage.png',
        purchased: false, // Add a flag to mark if the item has been purchased
        source: 'api', // Mark the source as API
      });
    }
  }

  function addTicketToCart(ticket) {
    const itemIndex = cartItems.value.findIndex(
      item => item.id === ticket.id && item.source === 'firebase'
    );
    if (itemIndex !== -1) {
      // Check if the item is already purchased
      if (cartItems.value[itemIndex].purchased) {
        return; // Prevent adding already purchased item
      }
      cartItems.value[itemIndex].quantity += 1;
    } else {
      cartItems.value.push({
        id: ticket.id,
        eventName: ticket.eventName,
        eventDate: ticket.date,
        eventTime: ticket.eventTime,
        seatNumber: ticket.seatNumber || Math.floor(Math.random() * 100) + 1,
        pricePerItem: ticket.price || 50.00,
        quantity: 1,
        imageUrl: ticket.imageUrl || '/images/noimage.png',
        purchased: false, // Add a flag to mark if the item has been purchased
        source: 'firebase', // Mark the source as Firebase
      });
    }
  }

  function deleteItem(index) {
    cartItems.value.splice(index, 1);
  }

  function clearCart() {
    cartItems.value = [];
    localStorage.removeItem('cartItems'); // Clear local storage
  }

  // Remove purchased items from the cart
  function removePurchasedItems() {
    cartItems.value = cartItems.value.filter(item => !item.purchased);
  }

  // Watch for changes in cartItems and save to localStorage
  watch(cartItems, (newItems) => {
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  }, { deep: true });

  return {
    cartItems,
    addEventToCart,
    addTicketToCart,
    deleteItem,
    clearCart,
    removePurchasedItems,
  };
});
