<template>
  <div v-if="isSidebarOpen" class="overlay" @click="$emit('close')"></div>
  <aside :class="['sidebar', { open: isSidebarOpen, dark: isDarkMode }]" @click.stop>
    <div class="user-section">
      <i class="fas fa-user user-icon"></i>
      <span class="user-name">{{ userName || 'User' }}</span>
    </div>
    <ul>
      <li :class="{ active: isActive('/profile') }" @click="setActiveIcon($event, 'profile')">
        <i :class="getIconClass('profile')"></i>
        <RouterLink to="/profile">Profile</RouterLink>
      </li>
      <li :class="{ active: isActive('/payment') }" @click="setActiveIcon($event, 'payment')">
        <i :class="getIconClass('payment')"></i>
        <RouterLink to="/payment">Checkout</RouterLink>
      </li>
      <li :class="{ active: isActive('/purchase-history') }" @click="setActiveIcon($event, 'purchase-history')">
        <i :class="getIconClass('purchase-history')"></i>
        <RouterLink to="/purchase-history">Purchase History</RouterLink>
      </li>
      <li :class="{ active: isActive('/settings') }" @click="setActiveIcon($event, 'settings')">
        <i :class="getIconClass('settings')"></i>
        <RouterLink to="/settings">Settings</RouterLink>
      </li>
    </ul>

    <button class="logout-btn" @click="logout" aria-label="Log out">
      <i class="fas fa-sign-out-alt logout-icon"></i> Logout
    </button>
  </aside>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, RouterLink } from 'vue-router';
import { db } from '../../firebase';

const props = defineProps({
  isSidebarOpen: Boolean,
  isDarkMode: Boolean
});

const emit = defineEmits(['close']);

const auth = getAuth();
const router = useRouter();
const userName = ref('');
const activeIcon = ref('');

const isActive = (route) => {
  return router.currentRoute.value.path === route;
};

const setActiveIcon = (event, iconName) => {
  activeIcon.value = iconName;
};

const getIconClass = (iconName) => {
  if (activeIcon.value === iconName) {
    return 'fas fa-' + (iconName === 'profile' ? 'user-circle' : iconName === 'payment' ? 'shopping-cart' : iconName === 'purchase-history' ? 'history' : 'cog') + ' active-icon';
  }
  return 'fas fa-' + (iconName === 'profile' ? 'user-circle' : iconName === 'payment' ? 'shopping-cart' : iconName === 'purchase-history' ? 'history' : 'cog');
};

const fetchUserName = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      userName.value = userDoc.data().name || 'User';
    } else {
      console.log("User document not found!");
      userName.value = 'User';
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    userName.value = 'User';
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserName(user.uid);
    }
  });
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f1e6e2;
  position: fixed;
  top: 0;
  right: -250px;
  height: 100vh;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 2px;
}

.dark-mode .sidebar {
  background-color: #333;
}

.sidebar.open {
  right: 0;
}

.user-section {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e6ea;
  margin-bottom: 20px;
  margin-top: 20px;
  margin-left: 13px;
}

.dark-mode .user-section {
  border-bottom: 1px solid rgb(169, 166, 166);
}

.user-icon {
  font-size: 36px;
  color: #b7765c;
  margin-right: 15px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.dark-mode .user-name{
  color: rgb(169, 166, 166);
}

ul {
  list-style: none;
  padding: 0;
  flex-grow: 1;
}

ul li {
  display: flex;
  align-items: center;
  padding: 12px;
  font-size: 16px;
  color: #333;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.dark-mode ul li {
  color: rgb(169, 166, 166);
}

ul li:hover {
  background-color: #e2e6ea;
}

ul li.active {
  background-color: #b7765c;
  color: white;
}

ul li.active a {
  color: white;
}

ul li a {
  color: inherit;
  text-decoration: none;
  margin-left: 10px;
  font-weight: 500;
}

ul li i {
  font-size: 20px;
  color: gray; /* Default color for icons */
}

ul li.active i {
  color: white; /* Change color of active icon to white */
}

.logout-btn {
  margin-top: 20px;
  background-color: #b7765c;
  color: white;
  border: none;
  padding: 10px;
  width: 100%;
  cursor: pointer;
  border-radius: 6px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #5a6268;
}
.toggle-container {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Align items to the left */
  margin-top: 20px;
}

.toggle-container i {
  color: gray;
  margin-right: 10px; /* Adjusted for better spacing */
}

.toggle-label-text {
  font-size: 18px;
  color: #333;
  font-weight: 500;
  margin-right: 8px;
}

#toggle {
  appearance: none;
  width: 50px;
  height: 25px;
  border-radius: 15px;
  background-color: #ccc;
  position: relative;
  cursor: pointer;
  margin-left: auto; /* Spread the toggle button to the left */
  transition: background-color 0.5s ease-in;
}

#toggle:checked {
  background-color: #b7765c;
}

#toggle::before {
  content: "";
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 50%;
  left: 3px;
  transform: translateY(-50%);
  transition: left 0.5s ease-in;
}

#toggle:checked::before {
  left: 25px;
}


.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.fas {
  color: #b7765c;
}

.dark-icon {
  color: black; /* Moon icon color */
}

.yellow-icon {
  color: yellow; /* Sun icon color */
}

.logout-icon {
  color: white; /* Logout icon color */
}

.active-icon {
  color: white; /* Active icon color */
}
</style>
