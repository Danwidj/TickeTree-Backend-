<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Log In</h2>
      <p class="subtitle">Welcome back! Please log in to your account.</p>
      <form @submit.prevent="signin">
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i></label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="Email Address" 
            required 
            @input="validateEmail"
          />
        </div>
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i></label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Password" 
            required 
          />
        </div>
        <button type="submit">Log In</button>
        <button class="guest-button" @click="continueAsGuest">Continue as Guest</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <p class="signup-link">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
      <!-- Continue as Guest Button -->
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '../../../firebase';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const router = useRouter();

    const validateEmail = () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value)) {
        errorMessage.value = "Please enter a valid email address.";
      } else {
        errorMessage.value = "";
      }
    };

    const signin = async () => {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        // Check if the email is verified
        if (!user.emailVerified) {
          errorMessage.value = "Please verify your email address before logging in.";
          return;
        }

        // Retrieve stored temporary user information
        const tempUserInfo = localStorage.getItem('tempUserInfo');
        if (tempUserInfo) {
          const { userId, name, email, mobile, createdAt } = JSON.parse(tempUserInfo);

          // Add user to Firestore
          const userDocRef = doc(db, 'users', userId);
          await setDoc(userDocRef, {
            userId: userId,
            name: name,
            email: email,
            mobile: mobile,
            createdAt: createdAt,
          });

          // Remove temp user info from localStorage
          localStorage.removeItem('tempUserInfo');
        }

        // Set logged-in status in local storage
        localStorage.setItem('isLoggedIn', 'true');
        console.log("Successful sign in");
        router.push("/");
      } catch (error) {
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage.value = "Invalid email format.";
            break;
          case "auth/invalid-credential":
            errorMessage.value = "Invalid email or password.";
            break;
          case "auth/user-not-found":
            errorMessage.value = "No account with that email was found.";
            break;
          case "auth/wrong-password":
            errorMessage.value = "Incorrect password.";
            break;
          default:
            errorMessage.value = "An error occurred. Please try again.";
        }
      }
    };

    const continueAsGuest = () => {
      router.push("/");
    };

    return {
      email,
      password,
      errorMessage,
      signin,
      continueAsGuest,
      validateEmail,
    };
  }
};
</script>

<style scoped>

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  animation: fadeInUp 1s ease-in-out;
}

.login-form {
  width: 550px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-form h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-form .subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-group label {
  margin-right: 10px;
  color: #333;
  font-size: 18px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: none;
  outline: none;
  background: none;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #b7765c;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}


.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}

.signup-link {
  margin-top: 15px;
  font-size: 14px;
  color: black;
  font-weight: bold;
}

.signup-link a {
  color: #b7765c;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
  color: #1a5bb8;
}

.guest-button {
  margin-top: 10px;
  padding: 10px;
  width: 100%;
  background-color: grey;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

</style>
