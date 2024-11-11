<template>
  <div>
    <div v-if="loading" class="text-center">
      <span class="back d-flex align-items-center justify-content-center">
        <span>L</span>
        <span>o</span>
        <span>a</span>
        <span>d</span>
        <span>i</span>
        <span>n</span>
        <span>g</span>
      </span>
    </div>

    <div v-else>
      <!-- No events found -->
      <div v-if="visibleEvents.length === 0" class="text-center">
        <p>No events found for this category.</p>
      </div>

      <div v-else id="category-events" class="container mt-4">
        <div class="row mt-4">
          <div class="col text-center mb-4">
            <h1>{{ categoryName }} Events</h1>
            <h5>
              Discover exciting events in the {{ categoryName }} category!
            </h5>
          </div>
        </div>
      </div>

      <div class="row mx-5">
        <div
          v-for="event in visibleEvents"
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
                />
                <div class="overlay">
                  <span>{{ event.datetime_summary }}</span>
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
            </CardContent>
              <CardFooter></CardFooter>
            </RouterLink>
          </Card>
        </div>
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
import { fetchEvents } from "@/api/eventsApi";
import { useEventStore } from "@/stores/eventStore";
import { inject } from "vue";
import anime from 'animejs';

const isDarkMode = inject("isDarkMode");

const categoryMapping = {
  1: [190, 6],
  2: [7],
  3: [23, 21, 1, 11],
  4: [3],
};

const categoryNames = {
  1: "Entertainment",
  2: "Sports",
  3: "Arts & Culture",
  4: "Business & Education",
  5: "Exhibitions",
};

const props = defineProps(["categoryId"]);
const visibleEvents = ref([]);
const categoryName = ref("");
const loading = ref(true);

const eventStore = useEventStore();

const animateCards = () => {
    anime({
    targets: ".custom-card",
    translateY: [50, 0],
    opacity: [0, 1],
    delay: anime.stagger(500),
    easing: "easeOutExpo",
  });
}


watch(loading, async (newValue) => {
  if (!newValue) {
    await nextTick();
    animateCards();
  }
});

const fetchEventsForCategory = async (categoryIds) => {
  try {
    loading.value = true;
    const categoryParam = categoryIds.join(",");
    const events = await fetchEvents({
      category: categoryParam,
      order: "popularity",
      rows: 20,
    });

    visibleEvents.value = events;
    events.forEach((event) => {
      eventStore.addEventIfNotExists(event);
    });    
  } catch (error) {
    console.error("Error fetching events:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const apiCategoryIds = categoryMapping[props.categoryId] || [];
  categoryName.value = categoryNames[props.categoryId];
  fetchEventsForCategory(apiCategoryIds);
});
</script>


<style scoped>
.custom-card.light {
  background-color: rgb(255, 255, 255);
  height: 100%;
  border-radius: 0px;
  box-shadow: 3px 5px 10px rgba(15, 15, 15, 15); /* Soft shadow */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(10px);
  color: black;
}
.custom-card.dark {
  background-color: rgb(0, 0, 0);
  height: 100%;
  border-radius: 0px;
  box-shadow: 3px 5px 10px rgb(240, 240, 240); /* Soft shadow */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(15px);
  color: rgb(245, 245, 245);
}

.custom-card.light:hover {
  box-shadow: 7px 11px 20px rgba(15, 15, 15, 5); /* Hard shadow */
  transform: translateY(-10px); /* Lift the card on hover */
}
.custom-card.dark:hover {
  transform: translateY(-10px); /* Lift the card on hover */
  box-shadow: 7px 11px 20px rgb(255, 255, 255); /* Hard shadow */
}
.custom-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.custom-link:hover {
  text-decoration: none;
}

.image-container {
  position: relative;
}

.card-img-top {
  height: 250px;
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
.image-container {
  position: relative;
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

.back {
  margin: 1em auto;
  font-family: "Roboto";
  height: 100vh;
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
.back span:nth-child(1) {
  animation-delay: 0s;
}
.back span:nth-child(2) {
  animation-delay: 0.1s;
}
.back span:nth-child(3) {
  animation-delay: 0.2s;
}
.back span:nth-child(4) {
  animation-delay: 0.3s;
}
.back span:nth-child(5) {
  animation-delay: 0.4s;
}
.back span:nth-child(6) {
  animation-delay: 0.5s;
}
.back span:nth-child(7) {
  animation-delay: 0.6s;
}
</style>
