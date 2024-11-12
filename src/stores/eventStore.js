import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { fetchEvents } from '@/api/eventsApi';

export const useEventStore = defineStore('eventStore', {
  state: () => ({
    events: [],
    recentlyViewed: [], // New array to store recently viewed events
    selectedEvent: null,
  }),

  actions: {
    async loadEvents() {
      if (this.events.length) return;
      try {
        this.events = await fetchEvents({ order: 'popularity', rows: 20 });
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    },

    selectEventById(eventId) {
      this.selectedEvent = this.events.find(event => event.id === Number(eventId)) || null;
      if (this.selectedEvent) {
        this.addRecentlyViewed(this.selectedEvent); // Add event to recently viewed when selected
      }
    },

    addEventIfNotExists(event) {
      const eventExists = this.events.some(e => e.id === event.id);
      if (!eventExists) {
        this.events.push(event);
      }
    },

    // New action to add an event to recently viewed
    addRecentlyViewed(event) {
      // Remove the event if it already exists in recentlyViewed to avoid duplicates
      this.recentlyViewed = this.recentlyViewed.filter(e => e.id !== event.id);
      // Add the event to the start of the array
      this.recentlyViewed.unshift(event);
      // Limit the array to a max of 10 items
      if (this.recentlyViewed.length > 10) {
        this.recentlyViewed.pop();
      }
    }
  },
});
