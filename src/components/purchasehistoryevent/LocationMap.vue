<template>
  <div class="location-map">
    <h5>Location:</h5>
    <div id="map" style="width: 100%; height: 300px;"></div>
  </div>
</template>

<script>
export default {
  name: 'LocationMap',
  props: ['locationName'],
  mounted() {
    window.initMap = this.initMap;
    this.loadGoogleMaps();
  },
  methods: {
    loadGoogleMaps() {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
      const script = document.createElement('script');
      // script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=marker&mapId=${mapId}`;
      script.async = true;
      script.defer = true;
      window.initMap = this.initMap;
      document.head.appendChild(script);
    },
    initMap() {
      const location = this.getLocationCoordinates(this.locationName);

      const map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
      });

      // new google.maps.Marker({
      //   position: location,
      //   map: map,
      // });
    },
    getLocationCoordinates(locationName) {
      const locations = {
        'The Star Theatre': { lat: 1.3076, lng: 103.8318 },
        'Singapore National Stadium': { lat: 1.304, lng: 103.8745 },
        'ArtScience Museum': { lat: 1.2861, lng: 103.8599 },
        'Sands Expo & Convention Centre': { lat: 1.2831, lng: 103.8603 },
        Taiwan: { lat: 23.6978, lng: 120.9605 },
        'Singapore Indoor Stadium': { lat: 1.3009, lng: 103.874 },
        // Add other locations as needed
      };

      return (
        locations[locationName] || { lat: 1.3521, lng: 103.8198 } // Default to Singapore
      );
    },
  },
};
</script>

<style scoped>
.location-map {
  /* Add styles if needed */
}
</style>