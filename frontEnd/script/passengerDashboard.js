
const ridesCtx = document.getElementById('rides-chart');

new Chart(ridesCtx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Rides',
      data: [5, 8, 6, 10, 7, 4, 1, 0, 0, 0, 0, 0]
    }]
  },
  options: {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
