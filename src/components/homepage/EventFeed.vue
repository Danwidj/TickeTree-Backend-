<template>
  <div class="container-fluid">
    <div class="row mt-4 mb-1">
      <div class="col fw-bold mb-2 fs-4 mx-4">Browse Events</div>
    </div>

    <!-- Filter Buttons -->
    <div class="row mb-4 mx-4">
      <div class="col">
        <button
          v-for="filter in filters"
          :key="filter"
          :class="[
            'btn',
            'btn-outline-primary',
            'btn-sm',
            'me-2',
            { active: currentFilter === filter },
          ]"
          @click="handleFilterClick(filter, $event)"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <div
      v-if="filteredEvents.length === 0 && currentFilter === 'Recently Viewed'"
      class="col-md-6 col-lg-4 mb-4 placeholder-box"
    >
      No events have been recently viewed
    </div>
    <!-- New Card -->
    <div v-else class="row mx-5">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="col-md-6 col-lg-4 mb-4"
      >
        <Card class="custom-card" :class="isDarkMode ? 'dark' : 'light'">
          <RouterLink
            :to="{ name: 'EventDetail', params: { id: event.id } }"
            class="custom-link"
          >
            <div class="image-container">
              <img
                :src="
                  event.images?.images[0]?.transforms?.transforms[5]?.url || event.images?.images[0]?.original_url
                "
                class="card-img-top"
                :alt="event.name"
              />
              <div class="overlay">
                <div class="fw-light">{{ event.datetime_summary }}</div>
              </div>
            </div>
            <CardHeader class="p-2">
              <CardDescription class="m-0 fst-italic fw-lighter">{{
                event.category.name
              }}</CardDescription>
              <CardTitle>{{ event.name }}</CardTitle>
            </CardHeader>
            <CardContent class="px-2 mb-3">
              <div>📍{{ event.location_summary }}</div>
              <div class="mt-3">
                Description:
                <span class="fw-lighter">{{
                  truncateDescription(event.description)
                }}</span>
              </div>
            </CardContent>
            <CardFooter> </CardFooter>
          </RouterLink>
        </Card>
      </div>
    </div>

    <!-- Show More Button for Popular view only -->
    <div class="row text-center mx-4" v-if="currentFilter === 'Popular'">
      <div class="col">
        <button
          class="mb-5 mt-2 btn btn-outline-primary"
          @click="toggleShowMore"
          @mouseenter="animateShowMoreButton"
        >
          {{ showAllEvents ? "Show Less" : "Show More" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useEventStore } from "@/stores/eventStore";
import anime from "animejs";

import { inject } from "vue";

const isDarkMode = inject("isDarkMode");

const filters = ["Popular", "Recently Viewed"];
const currentFilter = ref("Popular");

const setFilter = (filter) => {
  currentFilter.value = filter;
};

const visibleCount = ref(3);
const showAllEvents = ref(false);

const toggleShowMore = () => {
  showAllEvents.value = !showAllEvents.value;
  visibleCount.value = showAllEvents.value ? eventStore.events.length : 3;
};
const handleFilterClick = (filter, event) => {
  setFilter(filter);
  animateFilterButton(event);
};
const animateCards = () => {
  anime({
    targets: ".custom-card",
    translateY: [50, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    easing: "easeOutExpo",
  });
};

const animateFilterButton = (event) => {
  anime({
    targets: event.target,
    scale: [1, 1.1, 1],
    duration: 300,
    easing: "easeInOutQuad",
  });
};

const animateShowMoreButton = (event) => {
  anime({
    targets: event.target,
    scale: [1, 1.05, 1],
    duration: 300,
    easing: "easeInOutQuad",
  });
};

const truncateDescription = (text, maxLength = 100) => {
  return text && text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;
};

const eventStore = useEventStore();

onMounted(async () => {
  await eventStore.loadEvents();
  nextTick(() => {
    animateCards();
  });
});

// Watch filteredEvents and animate only when there’s a change
const filteredEvents = computed(() => {
  if (currentFilter.value === "Recently Viewed") {
    return eventStore.recentlyViewed;
  } else {
    return eventStore.events.slice(0, visibleCount.value);
  }
});

watch(filteredEvents, () => {
  nextTick(() => {
    animateCards();
  });
});
</script>


<style scoped>
.custom-card.light {
  background-color: rgb(255, 255, 255);
  height: 100%;
  border-radius: 0px;
  box-shadow: 3px 5px 10px rgba(15, 15, 15, 15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(50px);
  color: black;
}
.custom-card.dark {
  background-color: rgb(0, 0, 0);
  height: 100%;
  border-radius: 0px;
  box-shadow: 3px 5px 10px rgba(240, 240, 240, 240);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(50px);
  color: rgb(245, 245, 245);
}

.custom-card.light:hover {
  box-shadow: 7px 11px 20px rgba(15, 15, 15, 15); /* Hard shadow */
  transform: translateY(-10px); /* Lift the card on hover */
}
.custom-card.dark:hover {
  transform: translateY(-10px); /* Lift the card on hover */
  box-shadow: 7px 11px 20px rgb(255, 255, 255); /* Hard shadow */
}

.image-container {
  position: relative;
}

.card-img-top {
  height: 200px;
  width: 100%;
  object-fit: cover;
  position: relative;
  background-color: #ffffff;
  border-radius: 0px;
}

/* Adjust height for smaller screens */
@media (max-width: 768px) {
  .card-img-top {
    height: 150px;
  }
}

@media (max-width: 576px) {
  .card-img-top {
    height: 120px;
  }
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.7),
    rgba(0, 0, 0, 0)
  );
  color: #ffffffdd;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-family: Arial, sans-serif;
}

.btn-outline-primary {
  color: #b7765c !important;
  border: #b7765c solid 0.5px !important;
}

.btn-outline-primary:hover {
  background-color: #b9806a37 !important;
}

.btn-outline-primary.active {
  background-color: #b7765c !important;
  color: white !important;
  border: #b7765c;
}

.custom-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.custom-link:hover {
  text-decoration: none;
}

.placeholder-box {
  margin: auto;
  height: 550px;
  font-size: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>