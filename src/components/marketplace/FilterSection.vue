<template>
  <div class="d-flex flex-wrap justify-content-start align-items-center mb-3">
    <!-- Filter Dropdown Button -->
    <div class="dropdown">
      <button
        class="btn btn-secondary dropdown-toggle"
        type="button"
        id="filterDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Filter
      </button>

      <!-- Custom dropdown menu -->
      <div class="dropdown-menu p-3" aria-labelledby="filterDropdown">
        <div class="row gx-2 gy-3">
          <!-- Column for categories -->
          <div class="col-md-6">
            <h6 class="fw-bold mb-3">Categories</h6>
            <ul class="list-unstyled">
              <li v-for="category in categories" :key="category">
                <a class="dropdown-item py-1" @click="setCategory(category)">
                  {{ category }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Column for sort options -->
          <div class="col-12 col-md-6">
            <h6 class="fw-bold mb-3">Sort By</h6>
            <ul class="list-unstyled">
              <li v-for="(sort, index) in sortOptions" :key="index">
                <a class="dropdown-item py-1" @click="setSortOption(sort)">
                  {{ sort.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Price filter section -->
        <div class="mt-4">
          <h6 class="fw-bold">Price Range</h6>
          <div class="d-flex justify-content-between">
            <span>${{ priceRange[0] }}</span>
            <span>${{ priceRange[1] }}</span>
          </div>
          <div ref="slider" class="slider"></div>
        </div>
      </div>
    </div>

    <!-- Selected filters and sort option badges -->
    <div class="ms-0 ms-md-3 mt-3 mt-md-0">
      <span
        v-for="filter in displayedFilters"
        :key="filter.key"
        class="badge bg-info me-2 mb-2"
      >
        {{ filter.label }}
        <button 
          type="button" 
          class="btn-close btn-close-white ms-2" 
          aria-label="Remove" 
          @click="removeFilter(filter)"
        ></button>
      </span>
    </div>
  </div>
</template>

<script>
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

export default {
  name: 'FilterSection',
  props: {
    selectedFilters: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      categories: [
        'All',
        'Entertainment',
        'Sports',
        'Arts & Culture',
        'Business & Education'
      ],
      sortOptions: [
        { label: 'Price: Low to High', event: 'setPrice', value: 'low' },
        { label: 'Price: High to Low', event: 'setPrice', value: 'high' },
        { label: 'Date: Earliest First', event: 'setDate', value: 'ascending' },
        { label: 'Date: Latest First', event: 'setDate', value: 'descending' }
      ],
      priceRange: [0, 3000], 
      selectedSortOption: null, 
      selectedCategory: null,
      priceRangeChanged: false,
    };
  },
  computed: {
  displayedFilters() {
      const filters = [];

      // Show selected category as badge, except "All"
      if (this.selectedCategory && this.selectedCategory !== 'All') {
        filters.push({ key: 'category', label: this.selectedCategory });
      }

      // Add selected sort option as a badge if selected
      if (this.selectedSortOption) {
        filters.push({ key: 'sort', label: `Sort: ${this.selectedSortOption.label}` });
      }

      // Display price range badge only if the range has been changed by the user
      if (this.priceRangeChanged) {
        filters.push({ key: 'price', label: `Price: $${this.priceRange[0]} - $${this.priceRange[1]}` });
      }

      return filters;
    }
},
  mounted() {
    // Initialize noUiSlider
    noUiSlider.create(this.$refs.slider, {
      start: this.priceRange,
      connect: true,
      range: {
        'min': 0,
        'max': 3000
      },
      step: 1,
    });

    // Event listener for slider updates
    this.$refs.slider.noUiSlider.on('update', (values) => {
      const newRange = values.map(value => parseFloat(value));
      this.priceRange = newRange;

      // Check if the price range is different from the default, and update flag
      this.priceRangeChanged = !(newRange[0] === 0 && newRange[1] === 3000
      );
      
      // Emit event for price range update if changed
      this.updatePriceFilter();
    });
  },
  methods: {
    // Emit event to set a single category
    setCategory(category) {
      if (category === 'All') {
        this.selectedCategory = null;
        this.$emit('setCategory', null); // Emit event to show all tickets
      } else {
        this.selectedCategory = category;
        this.$emit('setCategory', category);
      }
    },

    // Emit event to set sort option and store selected sort option
    setSortOption(sort) {
      this.selectedSortOption = sort;
      this.$emit(sort.event, sort.value);
    },

    // Emit event to update the price filter
    updatePriceFilter() {
      this.$emit('setPriceRange', this.priceRange);
    },

    // Emit event to remove a filter, handle removal of sort or price filter
    removeFilter(filter) {
      if (filter.key === 'category') {
        this.selectedCategory = null;
        this.$emit('setCategory', null); // Reset to show all categories
      } else if (filter.key === 'sort') {
        this.selectedSortOption = null; // Reset sort option to null when removed
        this.$emit('setPrice', null); // Emit event to reset sorting
      } else if (filter.key === 'price') {
        this.priceRange = [0, 3000]; // Reset price range to default
        this.priceRangeChanged = false; // Reset flag when price range filter is removed
        this.$refs.slider.noUiSlider.set(this.priceRange); // Update the slider UI
        this.updatePriceFilter();
      }
    }
  }
};
</script>

<style scoped>
.dropdown-menu {
  width: 400px;
  max-width: 400px;
}

.row.gx-5 {
  gap: 30px;
}

.slider {
  margin-top: 10px;
}

.badge {
  background-color: #b7765c !important; /* Customize with your preferred color */
  color: white !important;
  margin-left: 0.5em;
  display: inline-flex;
  align-items: center;
}

.badge .btn-close {
  font-size: 0.7rem;
  margin-left: 0.5em;
}
.btn-secondary {
  background-color: #b7765c !important;
  color: white !important;
  border: #b7765c;
}

:deep(.noUi-target) {
  height: 8px;
  border: none;
  border-radius: 4px;
  background-color: #e0e0e0;
  box-shadow: none;
}

:deep(.noUi-connect) {
  background-color: #b7765c; 
}

:deep(.noUi-handle) {
  width: 20px;
  height: 20px;
  right: -10px; 
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

</style>