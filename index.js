/* ===== Budget App Logic — Rita ===== */

const STORAGE_KEY = "FlowBudget-data";

const CATEGORY_COLORS = {
  Food: "#16a34a",
  Transport: "#d97706",
  Housing: "#c2410c",
  Entertainment: "#7c3aed",
  Shopping: "#0891b2",
  Other: "#a8a29e",
};

// ===== State =====

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { budget: 0, expenses: [] };
}

let state = loadState();

function setState(updates) {
  state = Object.assign({}, state, updates);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
  render();
}

// ===== Helpers =====

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getTotalSpent() {
  return state.expenses.reduce(function (s, e) {
    return s + e.amount;
  }, 0);
}

function getRemaining() {
  return state.budget - getTotalSpent();
}

function getCategoryTotals() {
  return state.expenses.reduce(function (acc, e) {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
}

function escapeHtml(text) {
  var d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

// ===== CRUD =====

function addExpense(description, amount, category) {
  setState({
    expenses: [
      {
        id: crypto.randomUUID(),
        description: description.trim(),
        amount: parseFloat(amount),
        category: category,
        date: new Date().toISOString(),
      },
    ].concat(state.expenses),
  });
}

function deleteExpense(id) {
  setState({
    expenses: state.expenses.filter(function (e) {
      return e.id !== id;
    }),
  });
}

function setBudget(amount) {
  setState({ budget: parseFloat(amount) || 0 });
}

// ===== Render Sidebar =====

function renderSidebar() {
  const spent = getTotalSpent();
  const remaining = getRemaining();
  const budget = state.budget;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = remaining < 0;

  document.getElementById("sb-budget").textContent = formatMoney(budget);
  document.getElementById("sb-spent").textContent = formatMoney(spent);

  const remainEl = document.getElementById("sb-remaining");
  remainEl.textContent = formatMoney(remaining);
  remainEl.className =
    "sidebar-stat__value " + (isOver ? "negative" : "positive");

  document.getElementById("sb-pct").textContent = Math.round(pct) + "%";

  const bar = document.getElementById("sb-bar");
  bar.style.width = pct + "%";
  bar.className = "sidebar-progress-fill" + (isOver ? " over" : "");

  // categories
  const totals = getCategoryTotals();
  const sorted = Object.entries(totals).sort(function (a, b) {
    return b[1] - a[1];
  });
  const catEl = document.getElementById("sidebarCategories");

  if (sorted.length === 0) {
    catEl.innerHTML =
      '<p style="font-size:0.75rem;color:#57534e;padding:0.25rem 0">No expenses yet.</p>';
    return;
  }

  catEl.innerHTML = sorted
    .map(function (entry) {
      var cat = entry[0];
      var amt = entry[1];
      var color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
      return (
        '<div class="sidebar-cat-row">' +
        '<div class="sidebar-cat-dot" style="background:' +
        color +
        '"></div>' +
        '<span class="sidebar-cat-row__name">' +
        escapeHtml(cat) +
        "</span>" +
        '<span class="sidebar-cat-row__amount">' +
        formatMoney(amt) +
        "</span>" +
        "</div>"
      );
    })
    .join("");
}

// ===== Render Expenses =====

function renderExpenses() {
  const list = document.getElementById("expenseList");
  const emptyState = document.getElementById("emptyState");
  const countBadge = document.getElementById("expenseCount");
  const count = state.expenses.length;

  countBadge.textContent = count === 1 ? "1 item" : count + " items";

  if (count === 0) {
    list.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  list.innerHTML = state.expenses
    .map(function (e) {
      const date = new Date(e.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const color = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.Other;
      return (
        '<li class="expense-item">' +
        '<div class="expense-item__bar" style="background:' +
        color +
        '"></div>' +
        '<div class="expense-item__info">' +
        '<div class="expense-item__desc">' +
        escapeHtml(e.description) +
        "</div>" +
        '<div class="expense-item__meta">' +
        escapeHtml(e.category) +
        " · " +
        date +
        "</div>" +
        "</div>" +
        '<span class="expense-item__amount">−' +
        formatMoney(e.amount) +
        "</span>" +
        '<button class="btn btn--delete" data-delete="' +
        e.id +
        '">Delete</button>' +
        "</li>"
      );
    })
    .join("");
}

// ===== Render =====

function render() {
  renderSidebar();
  renderExpenses();

  const budgetInput = document.getElementById("budgetAmount");
  if (budgetInput && document.activeElement !== budgetInput) {
    budgetInput.value = state.budget > 0 ? state.budget : "";
  }
}

// ===== Init =====

document.addEventListener("DOMContentLoaded", function () {
  const monthEl = document.getElementById("currentMonth");
  if (monthEl) {
    monthEl.textContent = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  document
    .getElementById("budgetForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      setBudget(document.getElementById("budgetAmount").value);
    });

  document
    .getElementById("expenseForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      var desc = document.getElementById("expDesc").value;
      var amount = document.getElementById("expAmount").value;
      var category = document.getElementById("expCategory").value;
      if (!desc.trim() || !amount) return;
      addExpense(desc, amount, category);
      e.target.reset();
      document.getElementById("expDesc").focus();
    });

  document
    .getElementById("expenseList")
    .addEventListener("click", function (e) {
      var btn = e.target.closest("[data-delete]");
      if (btn) deleteExpense(btn.dataset.delete);
    });

  render();
});
