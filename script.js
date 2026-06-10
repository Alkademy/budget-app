// DOM elements
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionsListEl = document.getElementById('transactions-list');
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');

// Data store
let transactions = [];

// Helper: format currency
function formatMoney(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Update summary (balance, total income, total expense)
function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpense;

    balanceEl.textContent = formatMoney(balance);
    totalIncomeEl.textContent = formatMoney(totalIncome);
    totalExpenseEl.textContent = formatMoney(totalExpense);
}

// Render the transaction list
function renderTransactions() {
    if (transactions.length === 0) {
        transactionsListEl.innerHTML = '<p class="empty-message">No transactions yet. Add one above.</p>';
        return;
    }

    transactionsListEl.innerHTML = '';

    transactions.forEach(transaction => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `transaction-item ${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}`;

        // Left side: description + type label
        const infoDiv = document.createElement('div');
        infoDiv.className = 'transaction-info';

        const descP = document.createElement('div');
        descP.className = 'transaction-desc';
        descP.textContent = transaction.description;

        const typeSpan = document.createElement('div');
        typeSpan.className = 'transaction-type';
        typeSpan.textContent = transaction.type === 'income' ? 'Income' : 'Expense';

        infoDiv.appendChild(descP);
        infoDiv.appendChild(typeSpan);

        // Amount
        const amountSpan = document.createElement('div');
        amountSpan.className = `transaction-amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}`;
        const amountValue = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        amountSpan.textContent = formatMoney(amountValue);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('data-id', transaction.id);

        deleteBtn.addEventListener('click', () => {
            deleteTransaction(transaction.id);
        });

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(amountSpan);
        itemDiv.appendChild(deleteBtn);
        transactionsListEl.appendChild(itemDiv);
    });
}

// Delete transaction by id
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateSummary();
    renderTransactions();
}

// Add new transaction
function addTransaction(description, amount, type) {
    // basic validation
    if (!description.trim()) {
        alert('Please enter a description');
        return false;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a positive amount');
        return false;
    }

    const newTransaction = {
        id: Date.now(),
        description: description.trim(),
        amount: parseFloat(amount),
        type: type
    };

    transactions.push(newTransaction);
    return true;
}

// Handle form submit - THIS IS WHERE THE FIX IS
function handleFormSubmit(e) {
    e.preventDefault(); // This prevents page refresh
    
    console.log('Form submitted'); // You can check console to see it's working
    
    const description = descriptionInput.value;
    const amount = amountInput.value;
    const type = typeSelect.value;

    const success = addTransaction(description, amount, type);

    if (success) {
        // Clear form
        descriptionInput.value = '';
        amountInput.value = '';
        typeSelect.value = 'income';

        // Update UI
        updateSummary();
        renderTransactions();
    }
}

// Event listener
form.addEventListener('submit', handleFormSubmit);

// Initial render (empty state)
updateSummary();
renderTransactions();