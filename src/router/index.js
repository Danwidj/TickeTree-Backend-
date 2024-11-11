import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue"; // Import GuestView directly

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/marketplace",
      name: "marketplace",
      component: () => import("../views/Marketplace.vue"),
    },
    {
      path: "/login",
      component: () => import("@/views/Login.vue"),
      meta: { hideSidebar: true, hideNavbar: true, hideFooter: true },
    },
    {
      path: "/payment",
      name: "payment",
      component: () => import("../views/Payment.vue"),
    },
    {
      path: "/success",
      name: "success",
      component: () => import("../components/payment/Success.vue"),
    },
    {
      path: "/error",
      name: "error",
      component: () => import("../components/payment/Error.vue"),
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("../views/signup.vue"),
      meta: { hideNavbar: true, hideFooter: true },
    },
    {
      path: "/sidebar",
      name: "sidebar",
      component: () => import("../views/SideBar.vue"),
      meta: { hideNavbar: true, hideFooter: true },
    },
    {
      path: "/purchase-history",
      name: "PurchaseHistory",
      component: () => import("../views/PurchaseHistory.vue"),
    },
    {
      path: "/category/:categoryId",
      name: "CategoryEvents",
      component: () => import("../views/CategoryEvents.vue"),
      props: true,
    },
    {
      path: "/purchase-history/:orderID",
      name: "PurchaseHistoryEvent",
      component: () => import("@/views/PurchaseHistoryEvent.vue"),
      props: true,
    },
    {
      path: "/eventDetail/:id",
      name: "EventDetail",
      component: () => import("@/views/EventDetail.vue"),
      props: true,
    },
    {
      path: "/eventDetails/:id",
      name: "EventDetails",
      component: () => import("@/views/EventDetail.vue"),
      props: true,
    },
    {
      path: "/faqs",
      name: "faqs",
      component: () => import("@/views/faq.vue"),
      props: true,
    },
    {
      path: "/listedevent/:id",
      name: "ListedEvent",
      component: () => import("@/views/ListedEvent.vue"),
      props: true,
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/Profile.vue"),
      props: true,
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/Setting.vue"),
      props: true,
    },
  ],
  scrollBehavior(to,from,savedPosition) {
    return savedPosition || { top: 0}; // Default scroll behavior
  },
});


export default router;