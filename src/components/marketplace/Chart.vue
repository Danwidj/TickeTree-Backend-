<template>
  <div class="chart-wrapper">
    <div class="chart-container mb-4">
      <template v-if="loading">
        <div class="empty-state">
          <div class="empty-state-content">
            <p>Loading...</p>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="chartData.labels.length > 0" class="chart-canvas-container">
          <canvas ref="chartRef"></canvas>
        </div>
        <div v-else class="empty-state">
          <div class="empty-state-content">
            <svg 
              class="empty-state-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <h2 class="empty-state-title">
              No Past Transactions found
            </h2>
            <p class="empty-state-description">
              There is no price history available for this event at the moment.
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import Chart from 'chart.js/auto';

export default {
  props: {
    eventName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const chartRef = ref(null);
    const loading = ref(true);
    const chartData = ref({
      labels: [],
      prices: []
    });
    let chart = null;

    const parseDate = (dateStr) => {
      // Convert DD-MM-YYYY to Date object
      const [day, month, year] = dateStr.split('-');
      return new Date(year, month - 1, day);
    };

    const formatDate = (date) => {
      // Format date for display
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const fetchData = async () => {
      try {
        const ticketPriceCollection = collection(db, 'ticketPrices');
        const q = query(ticketPriceCollection, where('eventName', '==', props.eventName));
        const snapshot = await getDocs(q);

        const dataPoints = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          dataPoints.push({
            date: parseDate(data.eventDate),
            price: data.price
          });
        });

        // Sort data points chronologically
        dataPoints.sort((a, b) => a.date - b.date);

        // Format dates back to display format and separate into labels and prices
        chartData.value = {
          labels: dataPoints.map(point => formatDate(point.date)),
          prices: dataPoints.map(point => point.price)
        };
      } catch (error) {
        console.error('Error fetching ticket prices:', error);
        chartData.value = { labels: [], prices: [] };
      } finally {
        loading.value = false;
      }
    };

    const createChart = () => {
      if (!chartRef.value || chartData.value.labels.length === 0) return;

      const ctx = chartRef.value.getContext('2d');
      
      if (chart) {
        chart.destroy();
      }

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.value.labels,
          datasets: [{
            label: 'Ticket Price ($)',
            data: chartData.value.prices,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#2563eb',
            pointHoverBackgroundColor: '#1e40af',
            pointBorderColor: '#ffffff',
            pointHoverBorderColor: '#ffffff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1f2937',
              bodyColor: '#1f2937',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              usePointStyle: true,
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: $${value}`;
                }
              }
            },
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: {
                  size: 12,
                  family: "'Inter', sans-serif"
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { size: 12, family: "'Inter', sans-serif" }
              }
            },
            y: {
              // beginAtZero: true,
              grid: { color: '#f3f4f6' },
              ticks: {
                font: { size: 12, family: "'Inter', sans-serif" },
                callback: (value) => '$' + value
              }
            }
          }
        }
      });
    };

    onMounted(async () => {
      await fetchData();
      if (chartData.value.labels.length > 0) {
        createChart();
      }
      
      window.addEventListener('resize', () => {
        if (chart) {
          chart.resize();
        }
      });
    });

    onBeforeUnmount(() => {
      if (chart) {
        chart.destroy();
      }
      window.removeEventListener('resize', () => {
        if (chart) {
          chart.resize();
        }
      });
    });

    return { chartRef, loading, chartData };
  }
};
</script>

<style scoped>
.chart-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.chart-container {
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.chart-canvas-container {
  position: relative;
  height: 400px;
  width: 100%;
  overflow: hidden;
}

.empty-state {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-state-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #94a3b8;
}

.empty-state-title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.empty-state-description {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}
</style>