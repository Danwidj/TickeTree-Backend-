<template>
  <div class="signup-container">
    <div class="signup-form">
      <h2>Sign Up</h2>
      <p class="subtitle">Sign up for your TickeTree account here!</p>
      <form @submit.prevent="registerUser">
        <div class="form-group">
          <label for="name"><i class="fas fa-user"></i></label>
          <input type="text" v-model="name" placeholder="Name" required />
        </div>
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope"></i></label>
          <input type="email" v-model="email" placeholder="Email Address" required />
        </div>
        <div class="form-group">
          <label for="mobile"><i class="fas fa-phone"></i></label>
          <input type="text" v-model="mobile" placeholder="Mobile Number" required />
        </div>
        <div class="form-group">
          <label for="password"><i class="fas fa-lock"></i></label>
          <input type="password" v-model="password" placeholder="Password" required />
        </div>
        <div class="form-group">
          <label for="confirm-password"><i class="fas fa-lock"></i></label>
          <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />
        </div>
        <div class="terms">
          <input type="checkbox" v-model="agreeToTerms" />
          <label>
            I agree to all statements in <a href="#">Terms of service</a>
          </label>
        </div>
        <button type="submit" :disabled="!agreeToTerms">Sign Up</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <p class="login-link">
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>

    <!-- Success Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Signup Completed!</h2>
        <p>We have sent a verification email to your account. Please verify your email address before logging in.</p>
        <button @click="closeModal">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'vue-router'; // Import the router
import { auth } from '../../../firebase';

export default {
  setup() {
    const router = useRouter(); // Initialize the router
    const name = ref('');
    const email = ref('');
    const mobile = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const agreeToTerms = ref(false);
    const errorMessage = ref('');
    const showModal = ref(false); // Control modal visibility

    const registerUser = async () => {
      if (password.value !== confirmPassword.value) {
        errorMessage.value = "Passwords do not match!";
        return;
      }

      if (password.value.length < 6) {
        errorMessage.value = "Password must be at least 6 characters!";
        return;
      }

      const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      };

      if (!isValidEmail(email.value)) {
        errorMessage.value = "Invalid email format!";
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        console.log("User registered successfully!");

        // Send email verification
        await sendEmailVerification(userCredential.user);
        console.log("Verification email sent!");

        // Save user information in localStorage for future use
        localStorage.setItem('tempUserInfo', JSON.stringify({
          name: name.value,
          email: userCredential.user.email,
          mobile: mobile.value,
          createdAt: new Date().toISOString(),
          userId: userCredential.user.uid,
          password: password.value,
        }));

        // Show modal
        showModal.value = true;
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage.value = "Email is already in use!";
        } else {
          errorMessage.value = error.message;
        }
      }
    };

    const closeModal = () => {
      showModal.value = false; // Close the modal
      router.push('/login'); // Navigate to the login page after modal closes
    };

    return {
      name,
      email,
      mobile,
      password,
      confirmPassword,
      agreeToTerms,
      registerUser,
      errorMessage,
      showModal,
      closeModal,
    };
  }
};
</script>

<style scoped>

/* Smooth Entrance Animation */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  animation: fadeInUp 1s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.signup-form {
  width: 550px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.signup-form h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.signup-form .subtitle {
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

.terms {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 15px;
  color: #555;
}

.terms input {
  margin-right: 8px;
}

.terms a {
  color: #007bff;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
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

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}

.login-link {
  margin-top: 15px;
  font-size: 14px;
  color: black;
  font-weight: bold;
  text-decoration: none;
}

.login-link a {
  color: #b7765c;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
  color: #1a5bb8;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  width: 40%;
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin: 0 0 10px;
}

.modal-content p {
  margin: 0 0 20px;
}

.modal-content button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #0056b3;
}
</style>
