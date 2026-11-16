import { db } from './firebase.js';
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initAuth } from './auth.js';

let currentUserId = null;
let trendChartInstance = null;
let donutChartInstance = null;

const monthPicker = document.getElementById('analytics-month-picker');
monthPicker.value = new Date().toISOString().slice(0, 7);

initAuth(async (user) => {
  currentUserId = user.uid;
  loadAnalytics(monthPicker.value);
});

monthPicker.addEventListener('change', (e) => {
  loadAnalytics(e.target.value);
});

async function loadAnalytics(selectedMonth) {
  try {
    const q = query(collection(db, `users/${currentUserId}/transactions`));
    const snapshot = await getDocs(q);
    const transactions = [];
    snapshot.forEach(doc => transactions.push(doc.data()));

    const monthTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth));

    const categories = {};
    monthTxs.filter(tx => tx.type === 'expense').forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + Number(tx.amount);
    });

    renderCharts(categories, monthTxs);
  } catch (error) {
    console.error("Gagal memuat analitik:", error);
  }
}

function renderCharts(categories, transactions) {
  const ctxDonut = document.getElementById('analyticsDonutChart').getContext('2d');
  const ctxTrend = document.getElementById('analyticsTrendChart').getContext('2d');

  if (donutChartInstance) donutChartInstance.destroy();
  if (trendChartInstance) trendChartInstance.destroy();

  donutChartInstance = new Chart(ctxDonut, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories).length ? Object.keys(categories) : ['Tidak ada pengeluaran'],
      datasets: [{
        data: Object.values(categories).length ? Object.values(categories) : [1],
        backgroundColor: ['#54277D', '#C8A5F0', '#171717', '#77766F', '#A52B27', '#D5D2C9', '#2B7D4F', '#D4AF37']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const dailyNet = {};
  transactions.sort((a, b) => a.date.localeCompare(b.date)).forEach(tx => {
    const val = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
    dailyNet[tx.date] = (dailyNet[tx.date] || 0) + val;
  });

  const dates = Object.keys(dailyNet);
  let cumulative = 0;
  const cumulativeData = dates.map(d => {
    cumulative += dailyNet[d];
    return cumulative;
  });

  trendChartInstance = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: dates.length ? dates : ['Belum ada transaksi'],
      datasets: [{
        label: 'Arus Kas Kumulatif Bulan Ini',
        data: cumulativeData.length ? cumulativeData : [0],
        borderColor: '#54277D',
        backgroundColor: 'rgba(84, 39, 125, 0.1)',
        fill: true,
        tension: 0.1
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}