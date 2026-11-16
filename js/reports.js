import { db } from './firebase.js';
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initAuth } from './auth.js';
import { formatIDR } from './utils.js';

let currentUserId = null;
let currentOffset = 0;

initAuth(async (user) => {
  currentUserId = user.uid;
  loadWeeklyReport();
});

document.getElementById('prev-week-btn').addEventListener('click', () => { currentOffset--; loadWeeklyReport(); });
document.getElementById('next-week-btn').addEventListener('click', () => { currentOffset++; loadWeeklyReport(); });
document.getElementById('current-week-btn').addEventListener('click', () => { currentOffset = 0; loadWeeklyReport(); });

async function loadWeeklyReport() {
  try {
    const q = query(collection(db, `users/${currentUserId}/transactions`));
    const snapshot = await getDocs(q);
    const transactions = [];
    snapshot.forEach(doc => transactions.push(doc.data()));

    const { start, end } = getWeekRange(currentOffset);
    document.getElementById('week-range-label').textContent = `Periode: ${formatDateStr(start)} s.d. ${formatDateStr(end)}`;

    const weeklyTxs = transactions.filter(tx => {
      const txDate = new Date(tx.date + 'T00:00:00');
      return txDate >= start && txDate <= end;
    }).sort((a, b) => b.date.localeCompare(a.date));

    let income = 0, expense = 0;
    weeklyTxs.forEach(tx => {
      if (tx.type === 'income') income += Number(tx.amount);
      if (tx.type === 'expense') expense += Number(tx.amount);
    });

    document.getElementById('weekly-income').textContent = formatIDR(income);
    document.getElementById('weekly-expense').textContent = formatIDR(expense);
    document.getElementById('weekly-net').textContent = formatIDR(income - expense);

    const tbody = document.getElementById('weekly-transactions-body');
    if (weeklyTxs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center">Tidak ada transaksi pada minggu ini.</td></tr>`;
      return;
    }

    tbody.innerHTML = weeklyTxs.map(tx => `
      <tr>
        <td>${tx.date}</td>
        <td>${tx.category}</td>
        <td>${tx.description}</td>
        <td>${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
        <td>${formatIDR(tx.amount)}</td>
      </tr>
    `).join('');

  } catch (error) {
    console.error("Gagal memuat laporan mingguan:", error);
  }
}

function getWeekRange(offset) {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday + (offset * 7)));
  monday.setHours(0,0,0,0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23,59,59,999);

  return { start: monday, end: sunday };
}

function formatDateStr(date) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}