const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-key-codealpha',
    resave: false,
    saveUninitialized: true
}));

// Initialize Database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Products table
    db.run(`CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        description TEXT,
        image TEXT
    )`);

    // Orders table
    db.run(`CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        total REAL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Dummy Products Data
    const stmt = db.prepare("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)");
    stmt.run("Headphones", 999.00, "High quality wireless headphones", "https://via.placeholder.com/150");
    stmt.run("Smart Watch", 1999.00, "Feature-rich smart watch", "https://via.placeholder.com/150");
    stmt.run("Gaming Mouse", 499.00, "Ergonomic RGB gaming mouse", "https://via.placeholder.com/150");
    stmt.finalize();
});

// API Routes
// Get All Products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// Get Single Product
app.get('/api/products/:id', (req, res) => {
    db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(row);
    });
});

// User Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Username already exists!" });
        res.json({ message: "Registration successful!" });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        req.session.user = username;
        res.json({ message: "Login successful!", user: username });
    });
});

// Create Order
app.post('/api/orders', (req, res) => {
    const { username, total } = req.body;
    db.run("INSERT INTO orders (username, total) VALUES (?, ?)", [username, total], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Order placed successfully!", orderId: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});