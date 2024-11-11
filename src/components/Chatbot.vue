<template>
    <div></div> 
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  
  const chatbotApiKey = import.meta.env.VITE_AI_CHATBOT_API_KEY 
  
  onMounted(() => {
    (function(I, L, T, i, c, k, s) {
      if (I.iticks) return;
      I.iticks = { host: c, settings: s, clientId: k, cdn: L, queue: [] };
      var h = T.head || T.documentElement;
      var e = T.createElement(i);
      var l = I.location;
      e.async = true;
      e.src = (L || c) + '/client/inject-v2.min.js';
      h.insertBefore(e, h.firstChild);
      I.iticks.call = function(a, b) {
        I.iticks.queue.push([a, b]);
      };
    })(window, 'https://cdn-v1.intelliticks.com/prod/common', document, 'script', 'https://app.intelliticks.com', chatbotApiKey, {});
  });

  // to prevent promise rejection
  window.addEventListener("unhandledrejection", event => {
  console.warn("Unhandled promise rejection:", event.reason);
  event.preventDefault();  
});

  </script>
  
  <style scoped>
  </style>
  