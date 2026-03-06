const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

// Connect DB
connectDB();

const app = express();

// CORS
app.use(
    cors({
        origin: ["https://mernproject-0f1.onrender.com", "http://localhost:5173"],
        credentials: true,
    })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Production: serve frontend build
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running...");
    });
}

// Error middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});