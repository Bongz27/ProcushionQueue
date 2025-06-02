const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./database"); // PostgreSQL Pool from `database.js`

const app = express();
app.use(express.json()); // Enable JSON parsing

// CORS configuration
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Fetch Orders from PostgreSQL
app.get("/api/orders", async (req, res) => {
    try {
        console.log("🛠 Fetching latest orders...");
        const result = await pool.query("SELECT * FROM Order2 ORDER BY start_time DESC LIMIT 10");

        if (!result.rows.length) {
            return res.status(404).json({ message: "No orders found" });
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Add a New Order
app.post("/api/orders", async (req, res) => {
    try {
        await pool.query("BEGIN");

        const { transaction_id, client_name, client_contact, paint_type, color_code, category, priority, start_time, estimated_completion, current_status } = req.body;

        if (!transaction_id || !client_name || !client_contact || !paint_type || !category || !priority) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const values = [
            transaction_id,
            client_name,
            client_contact,
            paint_type,
            color_code || "Pending",
            category,
            priority || "Standard",
            start_time || new Date().toISOString(),
            estimated_completion || "N/A",
            current_status || "Pending"
        ];

        const query = `
            INSERT INTO Order2 (
                transaction_id, client_name, client_contact,
                paint_type, color_code, category, priority,
                start_time, estimated_completion, current_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

        const newOrder = await pool.query(query, values);
        await pool.query("COMMIT");

        res.status(201).json(newOrder.rows[0]);
    } catch (err) {
        await pool.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    }
});

// ✅ Root health check
app.get("/health", (req, res) => {
    res.send("🚀 Backend is alive!!");
});

// ✅ Serve React static files AFTER API routes
app.use(express.static(path.join(__dirname, "client", "build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));