<template>
  <div id="app" :class="{'dark-mode': isDarkMode}" class="app-container">
    <Navbar 
      v-if="!$route.meta.hideNavbar" 
      :isLoggedIn="isLoggedIn" 
      @toggleSidebar="toggleSidebar"
      @toggleDarkMode="toggleDarkMode"
      :isDarkMode="isDarkMode"
    />
    
    <Sidebar 
      v-if="isLoggedIn && !$route.meta.hideSidebar" 
      :isSidebarOpen="showSidebar" 
      @close="toggleSidebar"
    ></Sidebar> 
    
    <div class="content">
      <RouterView />
    </div>
    
    <Footer v-if="!$route.meta.hideFooter"></Footer>
    <Chatbot/>
  </div>
</template>

<script setup>
import { ref,provide, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/views/SideBar.vue';  
import Footer from '@/components/Footer.vue';
import Chatbot from './components/Chatbot.vue';


const auth = getAuth();

const isLoggedIn = ref(false);
const showSidebar = ref(false);
const isDarkMode = ref(false); 
const route = useRoute();

// Check for dark mode preference from local storage
const checkDarkModePreference = () => {
  const storedPreference = localStorage.getItem('dark-mode');
  if (storedPreference) {
    isDarkMode.value = storedPreference === 'true';
  }
};

// Toggle dark mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('dark-mode', isDarkMode.value);
};

provide('isDarkMode', isDarkMode);

// Toggle sidebar visibility
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

// Check for user authentication status on mount
onMounted(() => {
  checkDarkModePreference();
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user;
  });
},

);
</script>

<style scoped>
body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
}

.app-container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s; /* Smooth transition */
  background-color: rgb(255, 244, 244);
  color: #3f1200;
}

.content {
  flex: 1;
  padding-top:60px;
}
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* Ensures the navbar stays above other elements */
}

.dark-mode {
  background-color: #121212; /* Dark background color */
  color: #fff4f0; /* Light text color */
}

.dark-mode .navbar, .dark-mode .sidebar, .dark-mode .footer {
  background-color: #1e1e1e; /* Dark background for components */
}
</style>
