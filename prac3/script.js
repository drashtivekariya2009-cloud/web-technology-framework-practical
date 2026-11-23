/*
    Secure Bank Ltd.
    Banking Utilities Application
*/

// Section 1: Check Loan Eligibility (Age, Income, Loan)
function checkEligibilitySection() {
    let age = Number(document.getElementById("userAge").value);
    let income = Number(document.getElementById("monthlyIncome").value);
    let loanAmount = Number(document.getElementById("eligibilityLoanAmount").value);
    let msgDiv = document.getElementById("eligibilityError");

    if (age <= 0 || income <= 0 || loanAmount <= 0) {
        msgDiv.innerHTML = "<span class='error-text'>Please enter valid Age, Monthly Income, and Loan Amount.</span>";
        return;
    }

    if (age < 21) {
        msgDiv.innerHTML = "<span class='error-text'>Loan Status: Not Eligible (Minimum age requirement is 21 years).</span>";
        return;
    }

    let eligible = (income >= 25000 && loanAmount <= income * 20);

    if (eligible) {
        if (income >= 50000) {
            msgDiv.innerHTML = "<span class='success-text'><b>Loan Status: Eligible</b><br>Eligible for higher loan category.</span>";
        } else {
            msgDiv.innerHTML = "<span class='success-text'><b>Loan Status: Eligible</b><br>Eligible for standard loan category.</span>";
        }
    } else {
        msgDiv.innerHTML = "<span class='error-text'><b>Loan Status: Not Eligible</b><br>Please increase your income or reduce the loan amount.</span>";
    }
}

// Section 2: Customer Information
function saveCustomerInfo() {
    let fName = document.getElementById("firstName").value.trim();
    let mName = document.getElementById("middleName").value.trim();
    let lName = document.getElementById("lastName").value.trim();
    let msgDiv = document.getElementById("customerInfoMsg");

    if (fName === "" || lName === "") {
        msgDiv.innerHTML = "<span class='error-text'>Please enter at least First Name and Last Name.</span>";
        return;
    }

    let fullName = fName + " " + (mName ? mName + " " : "") + lName;
    msgDiv.innerHTML = "<span class='success-text'>Customer Saved: <b>" + fullName + "</b></span>";
}

// Section 3: EMI Calculation
function calculateEMISection() {
    let principal = Number(document.getElementById("emiLoanAmount").value);
    let annualRate = Number(document.getElementById("emiInterestRate").value);
    let years = Number(document.getElementById("emiTenure").value);
    let msgDiv = document.getElementById("emiResultMsg");

    if (principal <= 0 || annualRate <= 0 || years <= 0) {
        msgDiv.innerHTML = "<span class='error-text'>Please enter valid loan details for EMI calculation.</span>";
        return;
    }

    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    let totalPayment = emi * months;
    let totalInterest = totalPayment - principal;

    msgDiv.innerHTML = 
        "<div class='success-text'>" +
        "<b>EMI Calculation Result:</b><br>" +
        "Loan Amount: ₹" + principal.toFixed(2) + "<br>" +
        "Monthly EMI: ₹" + emi.toFixed(2) + "<br>" +
        "Total Payment: ₹" + totalPayment.toFixed(2) + "<br>" +
        "Total Interest: ₹" + totalInterest.toFixed(2) +
        "</div>";
}

// Helper Interest Function
function calculateInterest(principal, rate, years) {
    return (principal * rate * years) / 100;
}

// Section 4: Account Information (Switch Case)
function displayAccountInfoSection() {
    let accountType = document.getElementById("accountType").value;
    let msgDiv = document.getElementById("accountInfoMsg");

    if (accountType === "") {
        msgDiv.innerHTML = "<span class='error-text'>Please select a valid account type.</span>";
        return;
    }

    let message = "";
    switch (accountType) {
        case "savings":
            message = "Savings Account selected.<br>Suitable for personal savings.";
            break;
        case "current":
            message = "Current Account selected.<br>Suitable for businesses and frequent transactions.";
            break;
        case "fixed":
            message = "Fixed Deposit selected.<br>Provides higher interest for fixed tenure.";
            break;
    }

    msgDiv.innerHTML = "<span class='success-text'>" + message + "</span>";
}

// Section 5: Generate Interest Table
function generateInterestTableSection() {
    let amount = Number(document.getElementById("depositAmount").value);
    let msgDiv = document.getElementById("tableResultMsg");

    if (amount <= 0) {
        msgDiv.innerHTML = "<span class='error-text'>Please enter a valid deposit amount.</span>";
        return;
    }

    let output = "<b>Interest Table (5% Annual Interest)</b>";
    output += "<table>";
    output += "<tr><th>Year</th><th>Interest</th><th>Total Amount</th></tr>";

    for (let year = 1; year <= 5; year++) {
        let interest = calculateInterest(amount, 5, year);
        let total = amount + interest;

        output += "<tr>" +
                    "<td>" + year + "</td>" +
                    "<td>₹" + interest.toFixed(2) + "</td>" +
                    "<td>₹" + total.toFixed(2) + "</td>" +
                  "</tr>";
    }

    output += "</table>";
    msgDiv.innerHTML = output;
}