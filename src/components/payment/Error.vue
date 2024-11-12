<template>
  <div class="error-container">
    <div class="error-header">
      <span class="error-icon">✖</span>
      <h1>Payment Failed</h1>
    </div>
    <p>Unfortunately, your payment could not be processed.</p>
    
    <h2 class="error-details-header">Error Details</h2> <!-- Heading outside the card -->
    <div class="error-details">
      <div class="error-info">
        <div>
          <p>Error Code:</p>
          <p>#ERR123</p>
        </div>
        <div>
          <p>Message:</p>
          <p>Payment was declined. Please try again.</p>
        </div>
      </div>
    </div>
      <div class="order-summary-card">
      <button class="retry-btn" @click="redirectToEvents">Try Again</button>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Error',
  data() {
    return {
      errorMessage: null,
    };
  },
  created() {
    // Extract error message from query parameters
    this.errorMessage = this.$route.query.message || "An unexpected error occurred.";
  },
  methods: {
    redirectToEvents() {
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.error-container {
  padding: 30px;
  max-width: 600px;
  margin: 30px auto; /* Set equal top and bottom margin */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Add this to ensure full vertical centering */
body, html {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-header {
  display: flex; /* Use flexbox for alignment */
  align-items: center; /* Center align items vertically */
  justify-content: center; /* Center content horizontally */
  padding: 20px 0;
}

.error-icon {
  font-size: 50px; /* Larger icon for emphasis */
  color: #e53935; /* Bright red color */
  margin-right: 10px; /* Add space between icon and heading */
}

h1 {
  color: #721c24; /* Dark red for consistency */
  font-size: 28px; /* Increased font size */
  margin: 0; /* Remove margin to align with icon */
}

p {
  font-size: 16px;
  color: #495057; /* Dark gray for better readability */
}

.error-details-header {
  font-weight: bold;
  font-size: 20px; 
  color: #721c24;
  margin-bottom: 15px;
  text-align: center; 
}

.error-details {
  font-size: 16px;
  padding: 20px;
  background-color: #f5c6cb; /* Background color for the error details */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.error-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #ddd;
}

.error-info div {
  text-align: left;
}

.retry-btn,
.home-btn {
  display: inline-block;
  background-color: #721c24; /* Dark red */
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.order-summary-card {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.retry-btn:hover,
.home-btn:hover {
  background-color: #c82333; /* Darker red on hover */
}
</style>
