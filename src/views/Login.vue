<template>
  <div class="login-page">
    <!-- <AuthNavbar /> -->
    <LoginForm @login="handleLogin" ref="loginForm" />
  </div>
</template>

<script>
import anime from 'animejs';
import AuthNavbar from '@/components/login/AuthNavbar.vue';
import LoginForm from '@/components/login/LoginForm.vue';

export default {
  components: {
    AuthNavbar,
    LoginForm,
  },
  methods: {
    handleLogin(credentials) {
      console.log('Login attempted with:', credentials);
      // authentication logic here
    },
  },
  mounted() {
    this.animateLoginForm();
  },
  methods: {
    animateLoginForm() {
      anime({
        targets: this.$refs.loginForm.$el,
        translateY: [1000, 0],
        opacity: [0, 1],
        duration: 5000,
        elasticity: 600, // Adds spring effect
          easing: 'spring(1, 80, 10, 0)'
      });
    },
  },
};
</script>

<style scoped>
/* Full Page Styling */
body {
  background: linear-gradient(135deg, #a35feb 0%, #002d7a 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  transition: background-color 0.4s ease;
}


/* Smooth Entrance Animation */
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.4s ease;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 400px;
  margin-top: 50px;
}

</style>