<template>
  <!-- <AuthNavbar/> -->
<sign-up-form/>
</template>

<script setup>
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import * as fb from "../../firebase";
import { ref } from "vue";
import SignUpForm from '@/components/signup/SignupForm.vue'
const email = ref("");
const password = ref("");
const register = () => {
  fb.createUser(fb.auth(), email.value, password.value)
    .then((data) => {
      console.log("Successful registration");
      console.log(email.value);
      console.log(password.value);
      router.push("/homeView");
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
    });
};
</script>

<style scoped>

</style>