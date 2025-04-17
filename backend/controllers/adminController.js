const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.signupAdmin = async (req, res) => {
    const { username, password, room_code } = req.body;
    if (!username || !password || !room_code) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query_admin = "INSERT INTO admins (username, password, room_code) VALUES (?, ?, ?)";
        db.query(query_admin, [username, hashedPassword, room_code], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Database Error while creating admin" });
            }

            // Now insert the same into users table as well
            const query_user = "INSERT INTO users (username, password, room_code) VALUES (?, ?, ?)";
            db.query(query_user, [username, hashedPassword, room_code], (err2) => {
                if (err2) {
                    return res.status(500).json({ error: "Admin created, but error adding to users table" });
                }

                res.status(201).json({ message: "Admin created successfully" });
            });
        });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.loginAdmin = (req, res) => {
    const { loginId, password, roomCode } = req.body;
    if (!loginId || !password || !roomCode) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.query("SELECT * FROM admins WHERE username = ? AND room_code = ?", 
        [loginId, roomCode], 
        async (err, results) => {
            if (err) return res.status(500).json({ error: "Database Error" });
            if (results.length === 0) return res.status(401).json({ error: "Invalid credentials!" });

            const admin = results[0];
            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials!" });

            res.status(200).json({ message: "Admin Login Successful!" });
        }
    );
};
