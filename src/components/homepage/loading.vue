<template>
  <Hero />
  <CategorySelection />
  <EventFeed />
</template>
<script setup>
import CategorySelection from "@/components/homepage/CategorySelection.vue";
import EventFeed from "@/components/homepage/EventFeed.vue";
import Hero from "@/components/homepage/Hero.vue";
import { ref } from "vue";
const suspense = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2500));
};
await suspense();
</script>
