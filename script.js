var expensesData = [];
var totalLimit = 0;
var selectedCurrency = 'sgd'; // Default currency code
var cryptoPrices = {};

// Fetch initial cryptocurrency prices
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,litecoin&vs_currencies=sgd';
fetch(CRYPTO_API)
    .then(response => response.json())
    .then(data => {
        cryptoPrices = data;
        setTotalLimit(); // Call setTotalLimit once cryptocurrency prices are fetched
    })
    .catch(error => console.error('Error fetching cryptocurrency prices:', error));

function setTotalLimit() {
    var inputLimit = prompt("Enter your total expense limit in " + selectedCurrency.toUpperCase() + ":");
    totalLimit = parseFloat(inputLimit);

    if (isNaN(totalLimit) || totalLimit <= 0) {
        alert("Invalid input. Please enter a valid total expense limit.");
        setTotalLimit(); // Retry until a valid input is provided
    } else {
        document.getElementById("total-limit").textContent = totalLimit.toFixed(2) + ' ' + selectedCurrency;
        updateRemainingBudget();
    }
}

function addExpense() {
    var name = document.getElementById("expense-name").value;
    var amountInput = document.getElementById("expense-amount");

    // Check if the entered amount is a non-empty, non-negative number
    if (name && amountInput.value !== "" && !isNaN(amountInput.value) && parseFloat(amountInput.value) >= 0) {
        var amount = parseFloat(amountInput.value);
        var totalExpenses = expensesData.reduce((total, expense) => total + expense.amount, 0);

        if (totalLimit > 0 && totalExpenses + amount > totalLimit) {
            displayExceedLimitMessage();
            return;
        }

        var expenseList = document.getElementById("expenses");
        var listItem = document.createElement("li");
        listItem.className = "expense-item";
        listItem.innerHTML = `<span>${name}</span><span>${amount.toFixed(2)} ${selectedCurrency}</span>
                             <button onclick="removeExpense(this)">Remove</button>`;
        expenseList.appendChild(listItem);

        expensesData.push({ name: name, amount: amount });

        document.getElementById("expense-name").value = "";
        amountInput.value = "";

        updatePieChart();
        updateRemainingBudget();
    } else {
        alert("Please enter a valid, non-negative expense amount.");
    }
}

function removeExpense(button) {
    var listItem = button.parentNode;
    var expenseList = document.getElementById("expenses");
    expenseList.removeChild(listItem);

    var expenseName = listItem.firstChild.textContent;
    expensesData = expensesData.filter(expense => expense.name !== expenseName);

    updatePieChart();
    updateRemainingBudget();
}

function displayExceedLimitMessage() {
    // Display a creative message or visual element
    alert("Oops! Your expenses exceed the total limit of " + totalLimit.toFixed(2) + ' ' + selectedCurrency);
}

// Existing code ...

function updatePieChart() {
    var ctx = document.getElementById("expense-pie-chart").getContext("2d");
    var labels = expensesData.map(expense => `${expense.name} (${expense.amount.toFixed(2)} ${selectedCurrency})`);
    var amounts = expensesData.map(expense => expense.amount);
    var remainingBalance = totalLimit - amounts.reduce((total, amount) => total + amount, 0);

    if (expensesData.length === 0) {
        labels = ["No Expenses"];
        amounts = [1];
        remainingBalance = totalLimit;
    }

    if (window.pieChart) {
        window.pieChart.destroy();
    }

    window.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.concat(['Remaining Balance']),
            datasets: [{
                data: amounts.concat([remainingBalance]),
                backgroundColor: getRandomColors(expensesData.length + 1),
            }]
        },
        options: {
            legend: {
                display: true,
                position: 'bottom',
            },
            responsive: true,
            onClick: function (event, elements) {
                if (elements.length > 0) {
                    // A slice is clicked, update remaining balance
                    var clickedElementIndex = elements[0]._index;
                    if (clickedElementIndex === expensesData.length) {
                        alert(`Remaining Balance: $${remainingBalance.toFixed(2)} ${selectedCurrency}`);
                    }
                }
            }
        }
    });
}

// Existing code ...


function updateRemainingBudget() {
    var totalExpenses = expensesData.reduce((total, expense) => total + expense.amount, 0);
    var remainingBudget = totalLimit - totalExpenses;
    document.getElementById("remaining-budget").textContent = `$${remainingBudget.toFixed(2)} ${selectedCurrency}`;
}

function changeCurrency(newCurrency) {
    selectedCurrency = newCurrency;

    // Update the total limit
    document.getElementById("total-limit").textContent = totalLimit.toFixed(2) + ' ' + selectedCurrency;

    // Update the currency for each expense item
    var expenseListItems = document.querySelectorAll("#expenses li");
    expenseListItems.forEach(item => {
        var amountElement = item.querySelector("span:last-child");
        var amount = parseFloat(amountElement.textContent);
        var convertedAmount = convertCurrency(amount, selectedCurrency);
        amountElement.textContent = convertedAmount.toFixed(2) + ' ' + selectedCurrency;
    });

    // Update the pie chart and remaining budget
    updatePieChart();
    updateRemainingBudget();
}

function convertCurrency(amount, newCurrency) {
    if (selectedCurrency === newCurrency) {
        return amount;
    } else {
        var conversionRate = cryptoPrices[selectedCurrency.toLowerCase()][newCurrency.toLowerCase()];
        if (conversionRate) {
            return amount * conversionRate;
        } else {
            console.error("Invalid currency code: " + newCurrency);
            return amount;
        }
    }
}

function getRandomColors(numColors) {
    var colors = [];
    for (var i = 0; i < numColors; i++) {
        var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        colors.push(randomColor);
    }
    return colors;
}

// Add event listener to dynamically update placeholder and prevent negative values
document.getElementById("expense-amount").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9.]/g, ''); // Allow only numbers and a dot
    if (parseFloat(this.value) < 0) {
        this.value = "";
    }
});

// Chatbot
function sendMessage() {
    var userInput = document.getElementById("chat-input").value;
    var chatMessages = document.getElementById("chat-messages");

    // Display user message
    var userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = "You: " + userInput;
    chatMessages.appendChild(userMessage);

    // Handle Isaac's response (you can make this more sophisticated)
    var isaacResponse = document.createElement("div");
    isaacResponse.className = "message isaac-message";
    isaacResponse.textContent = "Isaac: Thanks! I'm still learning, but feel free to ask me about your expenses.";
    chatMessages.appendChild(isaacResponse);

    // Clear the input field
    document.getElementById("chat-input").value = "";
}


