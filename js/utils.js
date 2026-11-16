export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp');
}

export function getCurrentDateFormatted() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('id-ID', options);
}

export const CATEGORIES = {
  income: ['Allowance', 'Salary', 'Freelance', 'Other Income'],
  expense: ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Education', 'Bills', 'Savings', 'Other Expenses']
};