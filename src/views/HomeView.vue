<template>
  <main>
    <Suspense>
      <template #default>
        <loading>
        </loading>
    </template>
    <template #fallback>
      <span class="back d-flex align-items-center justify-content-center">
	<span>L</span>
	<span>o</span>
	<span>a</span>
	<span>d</span>
	<span>i</span>
	<span>n</span>
	<span>g</span>
</span>
      </template>
    </Suspense>
  </main>
</template>


<script setup>
import Loading from "@/components/homepage/loading.vue";
</script>

<style scoped>
main {
  min-height: 40vh;
}

@import url(https://fonts.googleapis.com/css?family=Roboto:300);
html {
  height: 90%;
}

.back {
  margin: 1em auto;
  font-family: "Roboto";
  height: 100vh;
}
.back span {
  font-size: 3em;
  color: #ffd5b4;
  background: #262b37;
  display: table-cell;
  box-shadow: inset 0 0 5px rgba(38, 38, 38, 0.3), 0 5px 0 #000000;
  padding: 0 15px;
  line-height: 100px;
  animation: jumb 2s infinite;
  border-radius: 10px;
}
@keyframes jumb {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
    box-shadow: 0 15px 0 rgb(92, 44, 0);
  }
  100% {
    transform: translateY(0px);
  }
}
.back span:nth-child(1) {
  animation-delay: 0s;
}
.back span:nth-child(2) {
  animation-delay: 0.1s;
}
.back span:nth-child(3) {
  animation-delay: 0.2s;
}
.back span:nth-child(4) {
  animation-delay: 0.3s;
}
.back span:nth-child(5) {
  animation-delay: 0.4s;
}
.back span:nth-child(6) {
  animation-delay: 0.5s;
}
.back span:nth-child(7) {
  animation-delay: 0.6s;
}
</style>