const form = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

form.addEventListener("submit", function (event){
    event.preventDeafult();

    console.log("Form submitted!");
});