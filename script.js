const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dayFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});

const monthFmt = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

const CATEGORIES = {
  expense: [
    { id: 'food', label: 'Food & drink', color: '#f59e0b', glyph: '☕' },
    { id: 'housing', label: 'Housing', color: '#a78bfa', glyph: '⌂' },
    { id: 'transport', label: 'Transport', color: '#38bdf8', glyph: '▸' },
    { id: 'health', label: 'Health', color: '#fb7185', glyph: '+' },
    { id: 'shopping', label: 'Shopping', color: '#e879f9', glyph: '◇' },
    { id: 'other', label: 'Other', color: '#94a3b8', glyph: '●' },
  ],
  income: [
    { id: 'salary', label: 'Salary', color: '#5eead4', glyph: '★' },
    { id: 'freelance', label: 'Freelance', color: '#34d399', glyph: '✦' },
    { id: 'other-in', label: 'Other income', color: '#fbbf24', glyph: '●' },
  ],
};

const STORAGE_KEY = 'lumina-ledger';

const els = {
  monthLabel: document.getElementById('month-label'),
  prevMonth: document.getElementById('prev-month'),
  nextMonth: document.getElementById('next-month'),
  balance: document.getElementById('balance'),
  income: document.getElementById('income-total'),
  expense: document.getElementById('expense-total'),
  savedRate: document.getElementById('saved-rate'),
  spendFill: document.getElementById('spend-fill'),
  spendCaption: document.getElementById('spend-caption'),
  form: document.getElementById('entry-form'),
  formTitle: document.getElementById('form-title'),
  cancelEdit: document.getElementById('cancel-edit'),
  submitBtn: document.getElementById('submit-btn'),
  description: document.getElementById('description'),
  amount: document.getElementById('amount'),
  date: document.getElementById('date'),
  category: document.getElementById('category'),
  error: document.getElementById('form-error'),
  donut: document.getElementById('donut'),
  donutTotal: document.getElementById('donut-total'),
  legend: document.getElementById('legend'),
  ledger: document.getElementById('ledger'),
  search: document.getElementById('search'),
};

let entries = [];
let viewDate = startOfMonth(new Date());
let filter = 'all';
let query = '';
let editingId = null;

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function todayInputValue() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    entries = Array.isArray(parsed) ? parsed : [];
  } catch {
    entries = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function categoryMeta(type, id) {
  return (CATEGORIES[type] || []).find((c) => c.id === id) || CATEGORIES[type][0];
}

function fillCategories() {
  const type = document.querySelector('input[name="type"]:checked').value;
  const options = CATEGORIES[type];
  const previous = els.category.value;
  els.category.replaceChildren();
  options.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.label;
    els.category.appendChild(opt);
  });
  if (options.some((c) => c.id === previous)) {
    els.category.value = previous;
  }
}

function visibleEntries() {
  const key = monthKey(viewDate);
  return entries.filter((e) => {
    if (!e.date || e.date.slice(0, 7) !== key) return false;
    if (filter !== 'all' && e.type !== filter) return false;
    if (query && !e.description.toLowerCase().includes(query)) return false;
    return true;
  });
}

function monthEntries() {
  const key = monthKey(viewDate);
  return entries.filter((e) => e.date && e.date.slice(0, 7) === key);
}

function showError(message) {
  els.error.hidden = false;
  els.error.textContent = message;
}

function clearError() {
  els.error.hidden = true;
  els.error.textContent = '';
}

function resetForm() {
  editingId = null;
  els.form.reset();
  document.querySelector('input[name="type"][value="expense"]').checked = true;
  els.date.value = todayInputValue();
  fillCategories();
  els.formTitle.textContent = 'New entry';
  els.submitBtn.textContent = 'Save entry';
  els.cancelEdit.hidden = true;
  clearError();
}

function beginEdit(entry) {
  editingId = entry.id;
  document.querySelector(`input[name="type"][value="${entry.type}"]`).checked = true;
  fillCategories();
  els.description.value = entry.description;
  els.amount.value = entry.amount;
  els.date.value = entry.date;
  els.category.value = entry.category;
  els.formTitle.textContent = 'Edit entry';
  els.submitBtn.textContent = 'Update entry';
  els.cancelEdit.hidden = false;
  els.description.focus();
}

function renderHero(list) {
  const income = list.filter((e) => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
  const expense = list.filter((e) => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
  const balance = income - expense;
  const spentRatio = income > 0 ? Math.min(expense / income, 1) : expense > 0 ? 1 : 0;
  const saved = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;

  els.balance.textContent = money.format(balance);
  els.balance.classList.toggle('negative', balance < 0);
  els.income.textContent = money.format(income);
  els.expense.textContent = money.format(expense);
  els.savedRate.textContent = `${Math.round(saved)}%`;
  els.spendFill.style.width = `${spentRatio * 100}%`;

  if (!income && !expense) {
    els.spendCaption.textContent = 'Add a paycheck and a few purchases to see the month take shape.';
  } else if (!income) {
    els.spendCaption.textContent = 'Spending is recorded, but there is no income in this month yet.';
  } else if (expense > income) {
    els.spendCaption.textContent = `This month is ${money.format(expense - income)} over income.`;
  } else {
    els.spendCaption.textContent = `You kept ${money.format(income - expense)} of ${money.format(income)} earned.`;
  }
}

function renderBreakdown(list) {
  const expenses = list.filter((e) => e.type === 'expense');
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  els.donutTotal.textContent = total ? money.format(total).replace('.00', '') : '$0';

  if (!total) {
    els.donut.style.background = 'conic-gradient(rgba(148,163,184,0.18) 0 100%)';
    els.legend.innerHTML = '';
    const note = document.createElement('li');
    note.className = 'empty-note';
    note.textContent = 'Expenses will ring this chart by category.';
    els.legend.appendChild(note);
    return;
  }

  const buckets = new Map();
  expenses.forEach((e) => {
    const meta = categoryMeta('expense', e.category);
    const current = buckets.get(meta.id) || { ...meta, total: 0 };
    current.total += Number(e.amount);
    buckets.set(meta.id, current);
  });

  const rows = [...buckets.values()].sort((a, b) => b.total - a.total);
  let cursor = 0;
  const stops = rows.map((row) => {
    const start = cursor;
    cursor += (row.total / total) * 100;
    return `${row.color} ${start}% ${cursor}%`;
  });
  els.donut.style.background = `conic-gradient(${stops.join(',')})`;

  els.legend.replaceChildren();
  rows.forEach((row) => {
    const li = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = row.color;
    const name = document.createElement('span');
    name.textContent = row.label;
    const amt = document.createElement('span');
    amt.className = 'amt';
    amt.textContent = money.format(row.total);
    li.append(swatch, name, amt);
    els.legend.appendChild(li);
  });
}

function renderLedger(list) {
  els.ledger.replaceChildren();

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-ledger';
    empty.innerHTML = '<strong>Quiet month</strong><span>Nothing matches this view yet.</span>';
    els.ledger.appendChild(empty);
    return;
  }

  const groups = new Map();
  [...list]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .forEach((entry) => {
      const key = entry.date;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    });

  groups.forEach((group, date) => {
    const wrap = document.createElement('div');
    wrap.className = 'day-group';
    const label = document.createElement('p');
    label.className = 'day-label';
    label.textContent = dayFmt.format(new Date(`${date}T12:00:00`));
    wrap.appendChild(label);

    group.forEach((entry) => {
      const meta = categoryMeta(entry.type, entry.category);
      const row = document.createElement('article');
      row.className = 'row';

      const glyph = document.createElement('div');
      glyph.className = 'glyph';
      glyph.style.background = `${meta.color}22`;
      glyph.style.color = meta.color;
      glyph.textContent = meta.glyph;

      const copy = document.createElement('div');
      copy.className = 'copy';
      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = entry.description;
      const metaLine = document.createElement('span');
      metaLine.className = 'meta';
      metaLine.textContent = meta.label;
      copy.append(title, metaLine);

      const amount = document.createElement('span');
      amount.className = `amount ${entry.type === 'income' ? 'in' : 'out'}`;
      const signed = entry.type === 'income' ? Number(entry.amount) : -Number(entry.amount);
      amount.textContent = `${signed > 0 ? '+' : '−'}${money.format(Math.abs(signed))}`;

      const actions = document.createElement('div');
      actions.className = 'row-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'row-btn';
      editBtn.setAttribute('aria-label', `Edit ${entry.description}`);
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', () => beginEdit(entry));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'row-btn danger';
      delBtn.setAttribute('aria-label', `Delete ${entry.description}`);
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        entries = entries.filter((item) => item.id !== entry.id);
        if (editingId === entry.id) resetForm();
        save();
        render();
      });

      actions.append(editBtn, delBtn);
      row.append(glyph, copy, amount, actions);
      wrap.appendChild(row);
    });

    els.ledger.appendChild(wrap);
  });
}

function render() {
  els.monthLabel.textContent = monthFmt.format(viewDate);
  const monthList = monthEntries();
  renderHero(monthList);
  renderBreakdown(monthList);
  renderLedger(visibleEntries());
}

els.prevMonth.addEventListener('click', () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  render();
});

els.nextMonth.addEventListener('click', () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  render();
});

document.querySelectorAll('input[name="type"]').forEach((input) => {
  input.addEventListener('change', fillCategories);
});

document.querySelectorAll('.pill').forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.pill').forEach((el) => {
      el.classList.toggle('is-on', el === btn);
    });
    render();
  });
});

els.search.addEventListener('input', () => {
  query = els.search.value.trim().toLowerCase();
  render();
});

els.cancelEdit.addEventListener('click', resetForm);

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearError();

  const description = els.description.value.trim();
  const amount = Number(els.amount.value);
  const date = els.date.value;
  const type = document.querySelector('input[name="type"]:checked').value;
  const category = els.category.value;

  if (!description) {
    showError('Give this entry a short name.');
    els.description.focus();
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    showError('Amount needs to be greater than zero.');
    els.amount.focus();
    return;
  }
  if (!date) {
    showError('Pick a date for the ledger.');
    els.date.focus();
    return;
  }

  if (editingId) {
    entries = entries.map((entry) =>
      entry.id === editingId
        ? { ...entry, description, amount, date, type, category }
        : entry
    );
  } else {
    entries.push({
      id: Date.now(),
      description,
      amount,
      date,
      type,
      category,
    });
  }

  viewDate = startOfMonth(new Date(`${date}T12:00:00`));
  save();
  resetForm();
  render();
});

load();
els.date.value = todayInputValue();
fillCategories();
render();
