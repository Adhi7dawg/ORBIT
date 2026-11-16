import { db } from './firebase.js';
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initAuth } from './auth.js';
import { formatIDR, getCurrentDateFormatted } from './utils.js';

document.getElementById('current-date-display').textContent = getCurrentDateFormatted();

initAuth(async (user) => {
  await loadDashboardData(user.uid);
});

async function loadDashboardData(userId) {
  try {
    const q = query(collection(db, `users/${userId}/transactions`), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    calculateMetrics(transactions);
    renderRecentTransactions(transactions.slice(0, 5));
    renderCharts(transactions);
  } catch (error) {
    console.error("Gagal memuat data dashboard:", error);
  }
}

function calculateMetrics(transactions) {
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let totalIncomeAll = 0;
  let totalExpenseAll = 0;
  const currentMonth = new Date().toISOString().slice(0, 7);

  transactions.forEach(tx => {
    const amount = Number(tx.amount);
    if (tx.type === 'income') {
      totalIncomeAll += amount;
      if (tx.date.startsWith(currentMonth)) monthlyIncome += amount;
    } else if (tx.type === 'expense') {
      totalExpenseAll += amount;
      if (tx.date.startsWith(currentMonth)) monthlyExpense += amount;
    }
  });

  const netCashflow = monthlyIncome - monthlyExpense;
  const totalBalance = totalIncomeAll - totalExpenseAll;

  document.getElementById('monthly-income').textContent = formatIDR(monthlyIncome);
  document.getElementById('monthly-expense').textContent = formatIDR(monthlyExpense);
  document.getElementById('net-cashflow').textContent = formatIDR(netCashflow);
  document.getElementById('total-balance').textContent = formatIDR(totalBalance);
}

function renderRecentTransactions(transactions) {
  const tbody = document.getElementById('recent-transactions-body');
  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada transaksi tercatat.</td></tr>`;
    return;
  }

  tbody.innerHTML = transactions.map(tx => `
    <tr>
      <td>${tx.date}</td>
      <td>${tx.category}</td>
      <td>${tx.description}</td>
      <td><span class="badge ${tx.type}">${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
      <td>${formatIDR(tx.amount)}</td>
    </tr>
  `).join('');
}

let pieChartInstance = null;
let trendChartInstance = null;

function renderCharts(transactions) {
  const ctxTrend = document.getElementById('monthlyTrendChart').getContext('2d');
  const ctxPie = document.getElementById('expensePieChart').getContext('2d');

  if (pieChartInstance) pieChartInstance.destroy();
  if (trendChartInstance) trendChartInstance.destroy();

  const categories = {};
  transactions.filter(tx => tx.type === 'expense').forEach(tx => {
    categories[tx.category] = (categories[tx.category] || 0) + Number(tx.amount);
  });

  pieChartInstance = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories).length ? Object.keys(categories) : ['Belum ada data'],
      datasets: [{
        data: Object.values(categories).length ? Object.values(categories) : [1],
        backgroundColor: ['#54277D', '#C8A5F0', '#171717', '#77766F', '#A52B27', '#D5D2C9']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const months = {};
  transactions.forEach(tx => {
    const m = tx.date.slice(0, 7);
    if (!months[m]) months[m] = { income: 0, expense: 0 };
    if (tx.type === 'income') months[m].income += Number(tx.amount);
    if (tx.type === 'expense') months[m].expense += Number(tx.amount);
  });

  const sortedMonths = Object.keys(months).sort().slice(-6);

  trendChartInstance = new Chart(ctxTrend, {
    type: 'bar',
    data: {
      labels: sortedMonths.length ? sortedMonths : ['Bulan Ini'],
      datasets: [
        {
          label: 'Pemasukan',
          data: sortedMonths.length ? sortedMonths.map(m => months[m].income) : [0],
          backgroundColor: '#2B7D4F'
        },
        {
          label: 'Pengeluaran',
          data: sortedMonths.length ? sortedMonths.map(m => months[m].expense) : [0],
          backgroundColor: '#A52B27'
        }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}