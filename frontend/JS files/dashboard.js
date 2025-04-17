let currentType = "";
let transactions = [];
let currentPage = 1;
const transactionsPerPage = 5;
let totalBalance = 0;

// Chart Setup
let balanceHistory = {
    labels: [],
    datasets: [{
        label: "Total Balance Over Time",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false
    }]
};

let ctx = document.getElementById("balanceChart").getContext("2d");
let balanceChart = new Chart(ctx, {
    type: "line",
    data: balanceHistory,
    options: {
        responsive: true,
        scales: { y: { beginAtZero: false } }
    }
});

function handleTransactionType(type) {
    currentType = type;
    document.getElementById("givenBy").style.display = type === "Add Money" ? "block" : "none";
    document.getElementById("givenTo").style.display = type === "Withdraw Money" ? "block" : "none";
    document.getElementById("purpose").style.display = "block";
    document.querySelector(".confirm-btn").style.display = "inline-block";
}

function confirmTransaction() {
    const amountInput = document.getElementById("amount");
    const amount = parseFloat(amountInput.value.trim());
    const purpose = document.getElementById("purpose").value.trim();
    const username = currentType === "Add Money"
        ? document.getElementById("givenBy").value.trim()
        : document.getElementById("givenTo").value.trim();
    const room_code = localStorage.getItem("roomCode");
    const userType = localStorage.getItem("userType");

    if (userType !== "admin") {
        return Swal.fire("Access Denied", "Only admins can perform this action.", "error");
    }

    if (!room_code || !username || isNaN(amount) || !purpose || !currentType) {
        return Swal.fire("Incomplete Data", "Please fill all required fields.", "warning");
    }

    if (currentType === "Withdraw Money" && amount > totalBalance) {
        return Swal.fire("Insufficient Funds", "Withdrawal amount exceeds current balance.", "error");
    }

    fetch("http://localhost:5000/dashboard/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, room_code, type: currentType, amount, purpose })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            Swal.fire("Success!", data.message, "success");
            amountInput.value = "";
            document.getElementById("givenBy").value = "";
            document.getElementById("givenTo").value = "";
            document.getElementById("purpose").value = "";
            document.querySelector(".confirm-btn").style.display = "none";
            document.getElementById("givenBy").style.display = "none";
            document.getElementById("givenTo").style.display = "none";
            document.getElementById("purpose").style.display = "none";
            fetchTransactions(room_code); // Refresh list and balance
        } else {
            Swal.fire("Error", data.error || "Transaction failed", "error");
        }
    })
    .catch(err => {
        console.error("Transaction error:", err);
        Swal.fire("Error", "Server error during transaction", "error");
    });
}

async function fetchTransactions(roomCode) {
    try {
        const response = await fetch(`http://localhost:5000/dashboard/transactions?room_code=${roomCode}`);
        transactions = await response.json();
        calculateBalance();
        updateTable();
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

function calculateBalance() {
    totalBalance = transactions.reduce((acc, txn) => {
        return txn.type === "Add Money"
            ? acc + parseFloat(txn.amount)
            : acc - parseFloat(txn.amount);
    }, 0);

    document.getElementById("totalBalance").textContent = `₹${totalBalance.toFixed(2)}`;

    balanceHistory.labels = transactions.map(txn => new Date(txn.date).toLocaleDateString());
    balanceHistory.datasets[0].data = [];
    let runningBalance = 0;
    transactions.forEach(txn => {
        runningBalance += txn.type === "Add Money"
            ? parseFloat(txn.amount)
            : -parseFloat(txn.amount);
        balanceHistory.datasets[0].data.push(runningBalance);
    });

    balanceChart.update();
}

function updateTable() {
    let transactionTable = document.getElementById("transactionTable");
    transactionTable.innerHTML = "";

    let totalPages = Math.ceil(transactions.length / transactionsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    let startIndex = (currentPage - 1) * transactionsPerPage;
    let endIndex = startIndex + transactionsPerPage;
    let visibleTransactions = transactions.slice(startIndex, endIndex);

    visibleTransactions.forEach(transaction => {
        let newRow = transactionTable.insertRow();
        newRow.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.username}</td>
            <td>₹${transaction.amount}</td>
            <td>${transaction.type}</td>
            <td>${transaction.purpose}</td>
            <td><button onclick="deleteTransaction('${transaction.id}')">🗑 Delete</button></td>
        `;
    });

    updatePagination();
}

function updatePagination() {
    let totalPages = Math.ceil(transactions.length / transactionsPerPage);
    document.getElementById("paginationContainer").style.display = totalPages > 1 ? "block" : "none";
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
}

function nextPage() {
    let totalPages = Math.ceil(transactions.length / transactionsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateTable();
    }
}

function searchTransactions() {
    let userName = document.getElementById("searchUser").value.toLowerCase();
    let searchDate = document.getElementById("searchDate").value;
    let filtered = transactions.filter(t =>
        (userName ? t.username.toLowerCase().includes(userName) : true) &&
        (searchDate ? t.date === searchDate : true)
    );

    let table = document.getElementById("transactionTable");
    table.innerHTML = "";
    filtered.forEach(t => {
        let row = `<tr>
            <td>${t.date}</td>
            <td>${t.username}</td>
            <td>${t.amount}</td>
            <td>${t.type}</td>
            <td>${t.purpose}</td>
            <td>—</td>
        </tr>`;
        table.innerHTML += row;
    });
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

function filterTransactions() {
    let selectedMonth = document.getElementById("monthFilter").value;
    let rows = document.querySelectorAll("#transactionTable tr");
    let count = 0;

    rows.forEach(row => {
        let dateCell = row.querySelector("td:first-child");
        if (dateCell) {
            let transactionDate = new Date(dateCell.textContent);
            let transactionMonth = transactionDate.getMonth() + 1;

            if (selectedMonth === "all" || transactionMonth == selectedMonth) {
                row.style.display = "";
                count++;
            } else {
                row.style.display = "none";
            }
        }
    });

    document.getElementById("totalTransactions").textContent = count;
}

function filterBalanceChart() {
    let selectedMonth = document.getElementById("balanceMonthFilter").value;

    if (selectedMonth === "all") {
        balanceChart.data.labels = balanceHistory.labels;
        balanceChart.data.datasets[0].data = balanceHistory.datasets[0].data;
    } else {
        let monthIndex = parseInt(selectedMonth) - 1;
        let filteredLabels = [];
        let filteredData = [];

        balanceHistory.labels.forEach((date, index) => {
            let dateObj = new Date(date);
            if (dateObj.getMonth() === monthIndex) {
                filteredLabels.push(date);
                filteredData.push(balanceHistory.datasets[0].data[index]);
            }
        });

        balanceChart.data.labels = filteredLabels;
        balanceChart.data.datasets[0].data = filteredData;
    }

    balanceChart.update();
}

function toggleSidebar() {
    let sidebar = document.getElementById("sidebar");
    let mainContent = document.getElementById("mainContent");
    let toggleBtn = document.getElementById("floatingToggle");

    if (sidebar.classList.contains("hidden")) {
        sidebar.classList.remove("hidden");
        mainContent.classList.remove("expanded");
        toggleBtn.style.display = "none";
    } else {
        sidebar.classList.add("hidden");
        mainContent.classList.add("expanded");
        toggleBtn.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const roomCode = localStorage.getItem("roomCode");
    if (roomCode) fetchTransactions(roomCode);

    let sidebar = document.getElementById("sidebar");
    let mainContent = document.getElementById("mainContent");

    sidebar.classList.add("hidden");
    mainContent.classList.add("expanded");
});
