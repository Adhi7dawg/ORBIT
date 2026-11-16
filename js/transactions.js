import { db } from './firebase.js';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initAuth } from './auth.js';
import { formatIDR, CATEGORIES } from './utils.js';

let allTransactions = [];
let currentUserId = null;

initAuth(async (user) => {
  currentUserId = user.uid;
  await fetchTransactions();
});

const typeSelect = document.getElementById('tx-type');
const categorySelect = document.getElementById('tx-category');

function updateCategoryOptions() {
  const type = typeSelect.value;
  categorySelect.innerHTML = CATEGORIES[type].map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

typeSelect.addEventListener('change', updateCategoryOptions);
updateCategoryOptions();

async function fetchTransactions() {
  try {
    const q = query(collection(db, `users/${currentUserId}/transactions`), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    allTransactions = [];
    querySnapshot.forEach(docSnap => {
      allTransactions.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderTable(allTransactions);
  } catch (error) {
    console.error("Gagal mengambil transaksi:", error);
  }
}

function renderTable(transactions) {
  const tbody = document.getElementById('transactions-table-body');
  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada transaksi ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = transactions.map(tx => `
    <tr>
      <td>${tx.date}</td>
      <td>${tx.category}</td>
      <td>${tx.description}</td>
      <td>${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
      <td>${formatIDR(tx.amount)}</td>
      <td>
        <button class="btn-swiss-secondary" onclick="window.editTx('${tx.id}')">Edit</button>
        <button class="btn-swiss-danger" onclick="window.deleteTx('${tx.id}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}

const modal = document.getElementById('transaction-modal');
document.getElementById('open-add-modal').addEventListener('click', () => {
  document.getElementById('transaction-form').reset();
  document.getElementById('transaction-id').value = '';
  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
  updateCategoryOptions();
  document.getElementById('modal-title').textContent = 'Tambah Transaksi';
  modal.style.display = 'flex';
});

document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
document.getElementById('cancel-modal-btn').addEventListener('click', () => modal.style.display = 'none');

document.getElementById('transaction-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('transaction-id').value;
  const txData = {
    type: typeSelect.value,
    amount: Number(document.getElementById('tx-amount').value),
    category: categorySelect.value,
    description: document.getElementById('tx-description').value,
    date: document.getElementById('tx-date').value,
    updatedAt: new Date().toISOString()
  };

  try {
    if (id) {
      await updateDoc(doc(db, `users/${currentUserId}/transactions`, id), txData);
    } else {
      txData.createdAt = new Date().toISOString();
      await addDoc(collection(db, `users/${currentUserId}/transactions`), txData);
    }
    modal.style.display = 'none';
    await fetchTransactions();
  } catch (error) {
    alert("Gagal menyimpan transaksi: " + error.message);
  }
});

window.deleteTx = async function(id) {
  if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
    try {
      await deleteDoc(doc(db, `users/${currentUserId}/transactions`, id));
      await fetchTransactions();
    } catch (error) {
      alert("Gagal menghapus: " + error.message);
    }
  }
};

window.editTx = function(id) {
  const tx = allTransactions.find(t => t.id === id);
  if (!tx) return;

  document.getElementById('transaction-id').value = tx.id;
  document.getElementById('tx-type').value = tx.type;
  updateCategoryOptions();
  document.getElementById('tx-amount').value = tx.amount;
  document.getElementById('tx-category').value = tx.category;
  document.getElementById('tx-description').value = tx.description;
  document.getElementById('tx-date').value = tx.date;
  document.getElementById('modal-title').textContent = 'Ubah Transaksi';
  modal.style.display = 'flex';
};

document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('filter-category').addEventListener('change', applyFilters);

function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const type = document.getElementById('filter-type').value;
  const category = document.getElementById('filter-category').value;

  const filtered = allTransactions.filter(tx => {
    const matchSearch = tx.description.toLowerCase().includes(search);
    const matchType = type ? tx.type === type : true;
    const matchCat = category ? tx.category === category : true;
    return matchSearch && matchType && matchCat;
  });

  renderTable(filtered);
}