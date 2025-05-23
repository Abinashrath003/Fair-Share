const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.signupUser = async (req, res) => {
    const { username, password, room_code } = req.body;

    if (!username || !password || !room_code) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if room code exists in admins
    db.query("SELECT * FROM admins WHERE room_code = ?", [room_code], async (err, adminResults) => {
        if (err) return res.status(500).json({ error: "Database Error" });
        if (adminResults.length === 0) {
            return res.status(400).json({ error: "Invalid Room Code!" });
        }

        // Check if username already exists in users
        db.query("SELECT * FROM users WHERE username = ?", [username], async (err2, userResults) => {
            if (err2) return res.status(500).json({ error: "Database Error" });
            if (userResults.length > 0) {
                return res.status(409).json({ error: "Username already exists" });
            }

            // Proceed with signup
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = "INSERT INTO users (username, password, room_code) VALUES (?, ?, ?)";
            db.query(query, [username, hashedPassword, room_code], (err3) => {
                if (err3) return res.status(500).json({ error: "Database Error" });
                res.status(201).json({ message: "User created successfully" });
            });
        });
    });
};

exports.loginUser = (req, res) => {
    const { loginId, password, roomCode } = req.body;

    if (!loginId || !password || !roomCode) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.query(
        "SELECT * FROM users WHERE username = ? AND room_code = ?",
        [loginId, roomCode],
        async (err, results) => {
            if (err) return res.status(500).json({ error: "Database Error" });
            if (results.length === 0) return res.status(401).json({ error: "Invalid credentials!" });

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials!" });

            res.status(200).json({ message: "User Login Successful!" });
        }
    );
};
