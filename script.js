const form = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");

const transactions = [];

form.addEventListener("submit", function (event){
    event.preventDefault();

    const transaction = {
        amount: Number(amountInput.value),
        description: descriptionInput.value,
        type: typeInput.value,
        category: categoryInput.value
    };

    transactions.push(transaction);

    updateTotals();

    updateChart();

    renderTransactions();

    form.reset();
    amountInput.focus();

    console.log(transactions);

});

function updateTotals() {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }
    });

    const balance = income - expense;

    incomeEl.textContent = `$${income}`;
    expenseEl.textContent = `$${expense}`;
    balanceEl.textContent = `$${balance}`;
};

const ctx = document.getElementById("budgetChart");

const budgetChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Food", "Transport", "Housing", "Utilities"],
        datasets: [{
            label: "Expenses",
            data: [0, 0, 0, 0]
        }]
    }
});

function updateChart() {

    const totals = {
        food: 0,
        transport: 0,
        housing: 0,
        utilities: 0
    };

    transactions.forEach(transaction => {

        if (transaction.type === "expense") {
            totals[transaction.category] += transaction.amount;
        }

    });

    budgetChart.data.datasets[0].data = [
        totals.food,
        totals.transport,
        totals.housing,
        totals.utilities
    ];

    budgetChart.update();

}

function renderTransactions() {

    transactionList.innerHTML = "";

    transactions.forEach(transaction => {

        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${transaction.description}</strong><br>
            ${transaction.category} |
            ${transaction.type} |
            $${transaction.amount}
        `;

        transactionList.appendChild(li);

    });

}