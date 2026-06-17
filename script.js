if (localStorage.getItem("budgetProLoggedIn") !== "true") {
  window.location.href = "landingpage.html";
}
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const transactionList = document.getElementById("transactionList");

const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const scoreEl = document.getElementById("score");

const searchInput = document.getElementById("searchInput");
const insights = document.getElementById("insights");
const categoryList = document.getElementById("categoryList");

const goalName = document.getElementById("goalName");
const goalTarget = document.getElementById("goalTarget");
const goalSaved = document.getElementById("goalSaved");
const goalBtn = document.getElementById("goalBtn");
const goalDisplay = document.getElementById("goalDisplay");

const themeBtn = document.getElementById("themeBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let goal = JSON.parse(localStorage.getItem("goal")) || null;

addBtn.addEventListener("click", addTransaction);
searchInput.addEventListener("input", updateUI);
goalBtn.addEventListener("click", createGoal);
themeBtn.addEventListener("click", toggleTheme);
clearBtn.addEventListener("click", clearData);
exportBtn.addEventListener("click", exportCSV);

function addTransaction() {
  if (description.value.trim() === "" || amount.value.trim() === "") {
    alert("Please enter a description and amount");
    return;
  }

  const transaction = {
    id: Date.now(),
    description: description.value.trim(),
    amount: Number(amount.value),
    type: type.value,
    category: category.value,
    date: new Date().toLocaleDateString()
  };

  transactions.push(transaction);
  saveData();

  description.value = "";
  amount.value = "";

  updateUI();
}

function updateUI() {
  transactionList.innerHTML = "";

  let income = 0;
  let expense = 0;
  const categories = {};

  const searchText = searchInput.value.toLowerCase();

  const filteredTransactions = transactions.filter((item) =>
    item.description.toLowerCase().includes(searchText) ||
    item.category.toLowerCase().includes(searchText)
  );

  transactions.forEach((item) => {
    if (item.type === "income") {
      income += item.amount;
    } else {
      expense += item.amount;
      categories[item.category] = (categories[item.category] || 0) + item.amount;
    }
  });

  filteredTransactions.forEach((item) => {
    const li = document.createElement("li");
    li.className = item.type === "income" ? "income-item" : "expense-item";

    li.innerHTML = `
      <span>
        <strong>${item.description}</strong><br>
        ${item.category} • ${item.date} • $${item.amount.toLocaleString()}
      </span>
      <button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button>
    `;

    transactionList.appendChild(li);
  });

  const balance = income - expense;
  const score = calculateHealthScore(income, expense);

  incomeEl.textContent = `$${income.toLocaleString()}`;
  expenseEl.textContent = `$${expense.toLocaleString()}`;
  balanceEl.textContent = `$${balance.toLocaleString()}`;
  scoreEl.textContent = `${score}%`;

  updateInsights(income, expense, balance);
  updateCategories(categories);
  updateGoal();
}

function calculateHealthScore(income, expense) {
  if (income === 0) return 0;

  const savingsRate = ((income - expense) / income) * 100;

  if (savingsRate >= 50) return 100;
  if (savingsRate >= 30) return 85;
  if (savingsRate >= 20) return 70;
  if (savingsRate >= 10) return 55;
  if (savingsRate >= 0) return 40;

  return 20;
}

function updateInsights(income, expense, balance) {
  insights.innerHTML = "";

  let messages = [];

  if (income === 0 && expense === 0) {
    messages.push("Add your first transaction to see smart insights.");
  } else {
    if (expense > income) {
      messages.push("Your expenses are higher than your income. Reduce spending quickly.");
    }

    if (balance > 0) {
      messages.push(`Good job. You currently have $${balance.toLocaleString()} remaining.`);
    }

    if (income > 0) {
      const spendingRate = Math.round((expense / income) * 100);
      messages.push(`You have spent ${spendingRate}% of your income.`);
    }

    const foodTotal = transactions
      .filter((item) => item.category === "Food" && item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    if (foodTotal > 500) {
      messages.push("Food spending is getting high. Consider setting a weekly meal budget.");
    }
  }

  messages.forEach((message) => {
    const p = document.createElement("p");
    p.textContent = message;
    insights.appendChild(p);
  });
}

function updateCategories(categories) {
  categoryList.innerHTML = "";

  const categoryEntries = Object.entries(categories);

  if (categoryEntries.length === 0) {
    categoryList.innerHTML = "<p>No expense categories yet.</p>";
    return;
  }

  categoryEntries.forEach(([name, total]) => {
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `<strong>${name}</strong><span>$${total.toLocaleString()}</span>`;
    categoryList.appendChild(row);
  });
}

function createGoal() {
  if (
    goalName.value.trim() === "" ||
    goalTarget.value.trim() === "" ||
    goalSaved.value.trim() === ""
  ) {
    alert("Please fill in all goal fields");
    return;
  }

  goal = {
    name: goalName.value.trim(),
    target: Number(goalTarget.value),
    saved: Number(goalSaved.value)
  };

  localStorage.setItem("goal", JSON.stringify(goal));

  goalName.value = "";
  goalTarget.value = "";
  goalSaved.value = "";

  updateGoal();
}

function updateGoal() {
  if (!goal) {
    goalDisplay.innerHTML = "<p>No savings goal created yet.</p>";
    return;
  }

  const percent = Math.min(Math.round((goal.saved / goal.target) * 100), 100);

  goalDisplay.innerHTML = `
    <h3>${goal.name}</h3>
    <p>$${goal.saved.toLocaleString()} saved of $${goal.target.toLocaleString()}</p>
    <div class="progress">
      <div class="progress-bar" style="width: ${percent}%"></div>
    </div>
    <p>${percent}% complete</p>
  `;
}

function deleteTransaction(id) {
  transactions = transactions.filter((item) => item.id !== id);
  saveData();
  updateUI();
}

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function clearData() {
  if (confirm("Are you sure you want to reset all data?")) {
    transactions = [];
    goal = null;
    localStorage.removeItem("transactions");
    localStorage.removeItem("goal");
    updateUI();
  }
}

function exportCSV() {
  if (transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  let csv = "Description,Amount,Type,Category,Date\n";

  transactions.forEach((item) => {
    csv += `${item.description},${item.amount},${item.type},${item.category},${item.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "budget-transactions.csv";
  link.click();

  URL.revokeObjectURL(url);
}

updateUI();
const logoutBtn =
document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "budgetProLoggedIn"
      );

      window.location.href =
        "landingpage.html";

    }
  );

}