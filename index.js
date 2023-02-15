// Store references to HTML elements in consts.
const repayLoanButton = document.getElementById("repay-loan-button");

const bankBalanceElement = document.getElementById("bank-balance");
const outstandingLoanElement = document.getElementById("outstanding-loan");
const payAmountElement = document.getElementById("pay-amount");

const laptopsElement = document.getElementById("laptop-list-selector");
const titleElement = document.getElementById("laptop-title");
const descriptionElement = document.getElementById("laptop-description");
const specsElement = document.getElementById("laptop-specs");
const priceElement = document.getElementById("laptop-price");
const imageElement = document.getElementById("laptop-image");

// ** SECTION: BANK **
let bankBalance = 0;
let outstandingLoan = 0;

// FUNCTION: Hides the "Repay loan" button, since there is no active loan at the beginning of the session.
function hideRepayLoanButton() {
    repayLoanButton.style.visibility = 'hidden';
}

// FUNCTION: Handles a request for a loan, decides whether to grant it, and updates relevant values.
function getALoan() {
    if (outstandingLoan > 0) {
        alert("Loan denied: you can only take out one loan at a time.");
        return;
    }
    // Check value types
    let loanAmountInput = NaN;

    // Keep asking the user for a loan amount until a valid amount is provided.
    while (isNaN(loanAmountInput) || loanAmountInput == "") {
        loanAmountInput = prompt("How much money would you like to borrow?");
        if (isNaN(loanAmountInput) || loanAmountInput == "") {
            alert("Please type in a valid amount.")
        }
    }
    let loanAmount = parseInt(loanAmountInput);

    // Make sure loan amount requested isn't too high.
    if (loanAmount > bankBalance * 2) {
        alert("Loan denied: loan cannot be more than double your current balance.");
    }

    // If everything is in order, grant loan!
    else {
        bankBalance += loanAmount;
        outstandingLoan = loanAmount;
        bankBalanceElement.innerText = `Balance: ${bankBalance} kr.`;
        outstandingLoanElement.innerText = `Outstanding loan: ${outstandingLoan} kr.`;
        alert("Loan granted!");

        // Make the "Repay loan" button visible now that a loan has been taken out.
        repayLoanButton.style.visibility = 'visible';
    }
}


// ** SECTION: WORK **
let payAmount = 0;

// FUNCTION: Transfers money from "Pay" (in Work) to "Balance" (in Bank).
// Part of the money goes to pay down on the loan, if necessary.
function payToBank() {
    // If the user has an outstanding loan, 10% of pay goes to a downpayment.
    if (outstandingLoan > 0) {

        // If less than 10% is necessary to pay back the loan in full, pay only what's necessary.
        if (payAmount * 0.1 > outstandingLoan) {
            payAmount -= outstandingLoan;
            outstandingLoan = 0;
            repayLoanButton.style.visibility = 'hidden';
        }
        else {
            outstandingLoan -= payAmount * 0.1;
            payAmount -= payAmount * 0.1;
            // Hide the "Repay loan" button if the loan has been repaid in full.
            if (outstandingLoan === 0) {
                repayLoanButton.style.visibility = 'hidden';
            }
        }
    }

    bankBalance += payAmount;
    payAmount = 0;

    // Update on-screen values.
    bankBalanceElement.innerText = `Balance: ${bankBalance} kr.`;
    payAmountElement.innerText = `Pay: ${payAmount} kr.`;

    // Update the amount of the outstanding loan, but if it is zero, hide it.
    if (outstandingLoan > 0) {
        outstandingLoanElement.innerText = `Outstanding loan: ${outstandingLoan} kr.`;
    }
    else {
        outstandingLoanElement.innerText = "";
        repayLoanButton.style.visibility = 'hidden';
    }
    
}

// FUNCTION: Increments the "pay" amount every time it is invoked.
function workAndEarn() {
    payAmount += 100;

    // Update the on-screen "Pay" value.
    payAmountElement.innerText = `Pay: ${payAmount} kr.`;
}

// FUNCTION: Spends the entire sum of "pay" on paying back the loan.
// The remainder, if any, is transferred to "Balance" (in Bank).
function repayLoan() {

    // If the pay is more than what is needed to pay down the loan...
    if (payAmount > outstandingLoan) {

        payAmount -= outstandingLoan;
        outstandingLoan = 0;

        bankBalance += payAmount;
        payAmount = 0;
    }

    else {
        outstandingLoan -= payAmount;
        payAmount = 0;
    }

    // Update the amount of the outstanding loan, but if it is zero, hide it.
    if (outstandingLoan > 0) {
        outstandingLoanElement.innerText = `Outstanding loan: ${outstandingLoan} kr.`;
    }
    else {
        outstandingLoanElement.innerText = "";
        repayLoanButton.style.visibility = 'hidden';
    }

    // Update the on-screen "Bank balance" and "Pay" values (the latter should always be set to 0 here, but I'm not going to hardcode it to.)
    payAmountElement.innerText = `Pay: ${payAmount} kr.`;
    bankBalanceElement.innerText = `Balance: ${bankBalance} kr.`;
}

// FUNCTION: pretty self-explanatory. Checks that the bank balance is sufficient to purchase the laptop,
// and if it is, subtracts the price of the laptop and lets the user know they now own the laptop.
function buyLaptop() {
    const price = priceElement.innerText;

    if (price > bankBalance) {
        alert("Sorry, you don't have enough money to buy this laptop.");
    }
    else {
        bankBalance -= price;
        bankBalanceElement.innerText = `Balance: ${bankBalance} kr.`;
        alert("Congrats, you're now the (hopefully) proud owner of this laptop!");
    }
}


// ** SECTION: LAPTOPS **
let laptops = [];

fetch("https://hickory-quilled-actress.glitch.me/computers")
    .then(response => response.json())
    .then(data => laptops = data)
    .then(laptops => addLaptopsToList(laptops));

// Adds all the laptops to the "laptops" list.
const addLaptopsToList = (laptops) => {
    laptops.forEach(x => addSingleLaptopToList(x));

    // Populate screen with values for the first laptop on the list.
    titleElement.innerText = laptops[0].title;
    descriptionElement.innerText = laptops[0].description;
    specsElement.innerText = laptops[0].specs;
    specsElement.innerText = specsElement.innerText.replace(/,/g, '\n'); // Formats the specs into a list
    priceElement.innerText = laptops[0].price;
    imageElement.src = "https://hickory-quilled-actress.glitch.me/" + laptops[0].image;
}

// Used by addLaptopsToList, once for each laptop.
const addSingleLaptopToList = (laptop) => {
    const laptopElement = document.createElement("option");
    laptopElement.value = laptop.id;
    laptopElement.appendChild(document.createTextNode(laptop.title));
    console.log(laptopElement);
    laptopsElement.appendChild(laptopElement);
}

// Updates all values to those corresponding to the selected laptop.
const handleLaptopListChange = e => {
    const selectedLaptop = laptops[e.target.selectedIndex];
    titleElement.innerText = selectedLaptop.title;
    descriptionElement.innerText = selectedLaptop.description;
    specsElement.innerText = selectedLaptop.specs;
    specsElement.innerText = specsElement.innerText.replace(/,/g, '\n');
    priceElement.innerText = selectedLaptop.price;
    imageElement.src = "https://hickory-quilled-actress.glitch.me/" + selectedLaptop.image;
}

// Detects when the user selects a different laptop, and calls handleLaptopListChange to update all relevant values. 
laptopsElement.addEventListener("change", handleLaptopListChange);