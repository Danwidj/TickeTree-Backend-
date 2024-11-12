<template>
  <div class="container-fluid">
    <div class="row mt-4 mb-4">
      <div class="col fw-bold mb-2 fs-4 mx-4">Explore Categories</div>
    </div>

    <div class="row">
      <div
        v-for="(category, index) in categories"
        :key="category.id"
        :class="`${category.columnClass} category-container`"
      >
        <div
          :class="`category-item ${index % 2 === 0 ? 'left' : 'right'}`"
          ref="categoryItems"
        >
          <router-link
            :to="{ name: 'CategoryEvents', params: { categoryId: category.id }}"
            class="category-link"
          >
            <img
              :src="category.image"
              class="rounded-circle img-fluid category-image"
              :alt="`${category.name} Category`"
            />
          </router-link>
          <div class="mt-2 text-center">{{ category.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import anime from 'animejs/lib/anime.es.js';

// Sample categories data
const categories = [
  {
    id: 1,
    name: 'Entertainment',
    image: '/images/entertainment.jpg',
    columnClass: 'col-lg-3 col-md-6 col-sm-6 col-12 mb-3'
  },
  {
    id: 2,
    name: 'Sports',
    image: '/images/sports.jpg',
    columnClass: 'col-lg-3 col-md-6 col-sm-6 col-12 mb-3'
  },
  {
    id: 3,
    name: 'Arts & Culture',
    image: '/images/arts.jpg',
    columnClass: 'col-lg-3 col-md-6 col-sm-6 col-12 mb-3'
  },
  {
    id: 4,
    name: 'Business & Education',
    image: '/images/convention.jpg',
    columnClass: 'col-lg-3 col-md-6 col-sm-6 col-12 mb-3'
  },
];

const categoryItems = ref([]); // Reference to category elements

onMounted(() => {
  // Set up IntersectionObserver
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const direction = element.classList.contains('left') ? -1 : 1;

          // Slide in animation with Anime.js
          anime({
            targets: element,
            translateX: [100 * direction, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutExpo'
          });

          observer.unobserve(element); // Stop observing once animated
        }
      });
    },
    { threshold: 0.2 } // Trigger animation when 20% of the element is visible
  );

  // Attach observer to each category item
  categoryItems.value.forEach(item => {
    observer.observe(item);
  });
});
</script>

<style scoped>
.category-item {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
  opacity: 0; /* Start hidden for animation */
}

.category-item.left {
  transform: translateX(-100px); /* Start position for left slide-in */
}

.category-item.right {
  transform: translateX(100px); /* Start position for right slide-in */
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
}
</style>