<template>
  <div class="container mt-4 marketplace-section">
    <!-- Filter dropdown from FilterSection.vue -->
    <FilterSection
      :selectedFilters="selectedFilters"
      :categories="categories"
      @setAllCategories="addAllCategories"
      @setCategory="filterByCategory"
      @setPrice="sortByPrice"
      @setDate="sortByDate"
      @setPriceRange="filterByPriceRange"
      @removeFilter="removeFilter"
    />

    <!-- Render the filtered tickets with animation -->
    <div class="row g-3 mb-3">
      <div
        class="col-lg-4 col-md-6 col-sm-12 ticket-card"
        v-for="ticket in filteredTickets"
        :key="generateTicketKey(ticket)"
      >
        <TicketCard :ticket="ticket" />
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useTicketStore } from '@/stores/ticketStore.js';
import FilterSection from '@/components/marketplace/FilterSection.vue';
import TicketCard from '@/components/marketplace/TicketCard.vue';
import anime from 'animejs/lib/anime.es.js';

export default {
  components: {
    FilterSection,
    TicketCard,
  },
  setup() {
    const ticketStore = useTicketStore();

    const selectedFilters = ref([]);
    const selectedCategory = ref();
    const selectedSortOption = ref(null);
    const priceRange = ref([0, 3000]);

    onMounted(() => {
      if (!ticketStore.tickets.length) {
        ticketStore.fetchTickets();
      }
    });

    const allTickets = computed(() => ticketStore.tickets);

    const filteredTickets = computed(() => {
      let tickets = [...allTickets.value];
      if (selectedCategory.value) {
        tickets = tickets.filter((ticket) => ticket.category === selectedCategory.value);
      }
      tickets = tickets.filter(
        (ticket) => ticket.price >= priceRange.value[0] && ticket.price <= priceRange.value[1]
      );
      if (selectedSortOption.value) {
        if (selectedSortOption.value === 'low') {
          tickets.sort((a, b) => a.price - b.price);
        } else if (selectedSortOption.value === 'high') {
          tickets.sort((a, b) => b.price - a.price);
        } else if (selectedSortOption.value === 'ascending') {
          tickets.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (selectedSortOption.value === 'descending') {
          tickets.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
      }
      return tickets;
    });

    const categories = ['Entertainment', 'Sports', 'Arts & Culture', 'Business & Education'];

    function addAllCategories(categories) {
      selectedFilters.value = categories;
    }

    function filterByCategory(category) {
      selectedCategory.value = category;
    }

    function sortByPrice(order) {
      selectedSortOption.value = order;
    }

    function sortByDate(order) {
      selectedSortOption.value = order;
    }

    function filterByPriceRange(range) {
      priceRange.value = range;
    }

    function removeFilter(filter) {
      if (filter === 'category') {
        selectedCategory.value = null;
      } else if (filter === 'sort') {
        selectedSortOption.value = null;
      } else if (filter === 'price') {
        priceRange.value = [0, 3000];
      }
    }

    // Generate a unique key for each ticket based on filters
    const generateTicketKey = (ticket) => {
      return `${ticket.id}-${selectedCategory.value}-${selectedSortOption.value}-${priceRange.value.join('-')}`;
    };

    // Function to animate the cards
    function animateCards() {
      anime({
        targets: '.ticket-card',
        translateY: [100, 0], // Start from 50px below
        opacity: [0, 1], // Fade in
        easing: 'spring(1, 80, 10, 0)',
        duration: 300,
        delay: anime.stagger(300), // Add stagger for a cascading effect
      });
    }


watch(filteredTickets, async () => {
  // Wait until the DOM is updated with the new `filteredTickets`
  await nextTick();
  animateCards(); // Execute the animation function after the changes
});

    return {
      filteredTickets,
      selectedFilters,
      categories,
      addAllCategories,
      filterByCategory,
      sortByPrice,
      sortByDate,
      filterByPriceRange,
      removeFilter,
      generateTicketKey,
    };
  },
};
</script>
