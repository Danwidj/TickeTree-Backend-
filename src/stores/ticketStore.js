import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '../../firebase.js';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

export const useTicketStore = defineStore('ticketStore', () => {
  // State
  const tickets = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Action to fetch tickets from Firebase
  async function fetchTickets() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const querySnapshot = await getDocs(collection(db, 'ticket'));
      tickets.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      error.value = `Failed to fetch tickets: ${err.message}`;
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchTicketById(ticketId) {
    loading.value = true;
    error.value = null;
    try {
      const ticketRef = doc(db, 'ticket', ticketId);
      const ticketDoc = await getDoc(ticketRef);
      if (ticketDoc.exists()) {
        return { id: ticketDoc.id, ...ticketDoc.data() };
      } else {
        error.value = `Ticket with ID ${ticketId} not found.`;
        return null;
      }
    } catch (err) {
      error.value = `Failed to fetch ticket by ID: ${err.message}`;
      console.error(err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    fetchTicketById
  };
});
