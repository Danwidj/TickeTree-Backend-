 <template>
  <nav
    class="navbar navbar-expand-md custom-navbar"
    :class="{ 'navbar-white': !isDarkMode, 'navbar-dark': isDarkMode }"
  >
    <div class="container-fluid">
      <!-- Left Section with Logo -->
      <RouterLink class="navbar-brand d-flex me-auto" to="/">
        <div class="shape">
          <img src="/images/logo.png" alt="Logo" style="width: 50px" />
          <span class="brand-text">TickeTree</span>
        </div>
      </RouterLink>
      <!-- Navbar Toggle Button for Mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
        style="z-index: 1"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible Center Section with Navigation Items and Right Section -->
      <div
        class="collapse navbar-collapse"
        id="navbarNav"
        :class="{ light: !isDarkMode, dark: isDarkMode }"
      >
        <!-- Center Navigation Items -->
        <ul class="navbar-nav mx-auto d-flex justify-content-center">
          <div class="nav-background" :style="backgroundStyle"></div>
          <li
            v-for="(item, index) in navItems"
            :key="item.path"
            class="nav-item"
            @mouseover="handleHover(index)"
          >
            <RouterLink
              :to="item.path"
              class="nav-link"
              :class="{ active: route.path === item.path }"
              @click="handleClick(index)"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>

        <!-- Right Section with Dark Mode Toggle and User Info or Login Button -->
        <div class="d-flex align-items-center ms-auto">
          <!-- Dark Mode Toggle Icon -->
          <div
          class="ms-auto"
            :class="['dark-mode-icon', { dark: isDarkMode }]"
            @click="$emit('toggleDarkMode')"
          >
            <i :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
          </div>

          <!-- User Info Icon or Login Button -->
          <div
            v-if="isLoggedIn"
            class="user-info-wrapper"
            @click="$emit('toggleSidebar')"
          >
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <button v-else @click="goToLogin" class="btn login-btn ms-2">
            Login
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getAuth } from "firebase/auth";
import { useRouter, RouterLink, useRoute } from "vue-router";
import { inject } from 'vue';

const isDarkMode = inject('isDarkMode');
const auth = getAuth();
const router = useRouter();
const route = useRoute();
const isLoggedIn = ref(false);
const loading = ref(true);
const navContainer = ref(null);
const activeIndex = ref(0);
const hoverIndex = ref(null);




const navItems = ref([
  { path: "/", label: "Home" },
  { path: "/marketplace", label: "Marketplace" },
  { path: "/faqs", label: "FAQs" },
]);

const backgroundStyle = computed(() => {
  const index =
    hoverIndex.value !== null ? hoverIndex.value : activeIndex.value;
  const navItem = navContainer.value?.children[index];
  const width = navItem ? navItem.offsetWidth : 0;
  const left = navItem ? navItem.offsetLeft : 0;

  return {
    transform: `translateX(${left}px)`,
    width: `${width}px`,
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1,
  };
});

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    isLoggedIn.value = !!user;
    loading.value = false;
  });

  const currentIndex = navItems.value.findIndex(
    (item) => item.path === route.path
  );
  if (currentIndex !== -1) {
    activeIndex.value = currentIndex;
  } else {
    activeIndex.value = 0;
  }
});

const handleClick = (index) => {
  activeIndex.value = index;

  const navbarToggler = document.querySelector('.navbar-toggler');
  if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none' && !navbarToggler.classList.contains('collapsed')) {
    navbarToggler.click();
  }
};

const handleHover = (index) => {
  hoverIndex.value = index;
};

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.navbar {
  padding: 0;
}

.custom-navbar {
  background: #e8d0c6;
  height: 60px;
  width: 100%;
}

.navbar-brand {
  margin-right: 2rem;
}

.brand-text {
  color: #b7765c;
  font-weight: 600;
  font-size: 1.3rem;
  margin-left: 1rem;
}

.nav-background {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  height: 100%;
  border-radius: 8px;
  pointer-events: none;
  z-index: 0;
}

.nav-link {
  font-size: 16px;
  color: #b7765c;
  font-weight: 600;
  padding: 20px;
  display: flex;
  justify-content: center;
  border-radius: 8px;
  position: relative;
}

.nav-link:hover {
  color: #b7765c !important;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-link.active {
  color: #efded7 !important;
  background-color: #b7765c;
}

.user-info-wrapper {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.377);
  transition: all 0.2s ease;
}

.user-info-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b7765c;
}

.dark-mode-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #b7765c;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 1rem;
  transition: background-color 0.3s;
}

.dark-mode-icon i {
  font-size: 20px;
  color: #b7765c;
}

.dark-mode-icon.dark i {
  color: #b7765c;
}

.login-btn {
  background-color: #b7765c;
  color: #efded7;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border: none;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background-color: #efded78f;
  color: #b7765c;
  transform: translateY(-1px);
}

.navbar-nav {
  width: 100%;
}

@media (max-width: 768px) {
  .collapsing.light {
    background: #e8d0c6;
  }
  .collapsing.dark {
    background-color: black;
  }
  .navbar-nav {
    width: 100%;
  }

  .navbar-collapse {
    border-radius: 10px;
  }
  .navbar-collapse.collapse.show.light {
    background: #e8d0c6;
  }
  .navbar-collapse.collapse.show.dark {
    background-color: black;
  }
  .d-flex.align-items-center.ms-auto{
    padding: 10px 10px 10px 0px;
  }
}
</style>