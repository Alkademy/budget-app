let transactions = [];

function loadTransactions() {
  const saved = localStorage.getItem('transactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }
}

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function getBalance() {
  return transactions.reduce((total, t) => {
    const amount = parseFloat(t.amount);
    return t.type === 'income' ? total + amount : total - amount;
  }, 0);
}

function render() {
  const balanceEl = document.getElementById('balance');
  const listEl = document.getElementById('transaction-list');

  balanceEl.textContent = '$' + getBalance().toFixed(2);
  listEl.innerHTML = '';

  transactions.forEach((t) => {
    const li = document.createElement('li');
    li.className = t.type;
    li.textContent = `${t.description}: $${parseFloat(t.amount).toFixed(2)}`;
    listEl.appendChild(li);
  });
}

document.getElementById('transaction-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if (!description || isNaN(amount) || amount <= 0) return;

  transactions.push({
    id: Date.now(),
    description,
    amount,
    type,
  });

  saveTransactions();
  render();
  e.target.reset();
});

loadTransactions();
render();
