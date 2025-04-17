const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Add a new transaction
router.post("/transaction", dashboardController.createTransaction);

// Get all transactions for a room_code
router.get("/transactions", dashboardController.getTransactions);

module.exports = router;
