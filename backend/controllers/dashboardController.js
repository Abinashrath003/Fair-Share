
const db = require("../config/db");

// Create a transaction
exports.createTransaction = (req, res) => {
    const { username, room_code, type, amount, purpose } = req.body;

    if (!username || !room_code || !type || !amount || !purpose) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const insertQuery = `
        INSERT INTO transactions (username, room_code, type, amount, purpose)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [username, room_code, type, amount, purpose], (err, result) => {
        if (err) {
            console.error("Error inserting transaction:", err);
            return res.status(500).json({ error: "Failed to record transaction" });
        }

        return res.status(200).json({ message: "Transaction recorded successfully" });
    });
};

// Get all transactions for a room_code
exports.getTransactions = (req, res) => {
    const room_code = req.query.room_code;

    if (!room_code) {
        return res.status(400).json({ error: "Room code is required" });
    }

    const query = `
        SELECT id, username, type, amount, purpose, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS date 
        FROM transactions 
        WHERE room_code = ?
        ORDER BY date DESC
    `;

    db.query(query, [room_code], (err, results) => {
        if (err) {
            console.error("Error fetching transactions:", err);
            return res.status(500).json({ error: "Failed to fetch transactions" });
        }

        res.json(results);
    });
};

