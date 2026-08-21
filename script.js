const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

let transactions = [];
let currentFilter = 'all';

const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const formError = document.getElementById('form-error');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income-total');
const expenseEl = document.getElementById('expense-total');
const listEl = document.getElementById('transaction-list');

function loadTransactions() {
  const saved = localStorage.getItem('transactions');
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      transactions = parsed;
    }
  } catch {
    transactions = [];
  }
}

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function formatMoney(amount) {
  return money.format(Number(amount) || 0);
}

function getTotals() {
  return transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount);
      if (t.type === 'income') acc.income += amount;
      else acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

function showError(message) {
  formError.hidden = false;
  formError.textContent = message;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = '';
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  render();
}

function render() {
  const { income, expense } = getTotals();
  const balance = income - expense;

  balanceEl.textContent = formatMoney(balance);
  balanceEl.classList.toggle('is-negative', balance < 0);
  incomeEl.textContent = formatMoney(income);
  expenseEl.textContent = formatMoney(expense);

  const visible = transactions.filter((t) => {
    return currentFilter === 'all' || t.type === currentFilter;
  });

  listEl.replaceChildren();

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = transactions.length === 0
      ? 'No transactions yet. Add one above.'
      : 'No transactions in this filter.';
    listEl.appendChild(empty);
    return;
  }

  [...visible].reverse().forEach((t) => {
    const li = document.createElement('li');
    li.className = t.type;

    const copy = document.createElement('div');
    copy.className = 'item-copy';

    const title = document.createElement('span');
    title.className = 'item-title';
    title.textContent = t.description;

    const meta = document.createElement('span');
    meta.className = 'item-meta';
    const dateLabel = t.date ? dateFmt.format(new Date(t.date)) : 'No date';
    meta.textContent = `${t.category || 'Other'} · ${dateLabel}`;

    copy.append(title, meta);

    const amountEl = document.createElement('span');
    amountEl.className = 'item-amount';
    const signed = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
    amountEl.textContent = `${signed > 0 ? '+' : ''}${formatMoney(signed)}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', `Delete ${t.description}`);
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteTransaction(t.id));

    li.append(copy, amountEl, deleteBtn);
    listEl.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;

  if (!description) {
    showError('Please enter a description.');
    descriptionInput.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showError('Please enter an amount greater than 0.');
    amountInput.focus();
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date: new Date().toISOString(),
  });

  saveTransactions();
  render();
  form.reset();
  descriptionInput.focus();
});

document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter').forEach((el) => {
      el.classList.toggle('is-active', el === btn);
    });
    render();
  });
});

loadTransactions();
render();
