const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
// 1. THIS FIXES THE "ERROR": It tells the cloud to use its own port.
const PORT = process.env.PORT || 3000;
const DB_FILE = './database.json';

app.use(cors());
app.use(express.json());

// 2. THIS FIXES "CANNOT GET /": It serves your index.html and login.html
app.use(express.static('.')); 

// --- DATABASE FUNCTIONS ---
const readDatabase = () => {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

const writeDatabase = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- API ROUTES ---

app.get('/items', (req, res) => {
    res.json(readDatabase());
});

app.post('/items', (req, res) => {
    const inventory = readDatabase();
    const newItem = {
        id: Date.now(),
        name: req.body.name,
        quantity: parseInt(req.body.quantity),
        price: parseFloat(req.body.price) || 0
    };
    inventory.push(newItem);
    writeDatabase(inventory);
    res.json(newItem);
});

app.put('/items/:id', (req, res) => {
    const inventory = readDatabase();
    const id = parseInt(req.params.id);
    const item = inventory.find(i => i.id === id);
    
    if (item) {
        item.name = req.body.name;
        item.quantity = parseInt(req.body.quantity);
        item.price = parseFloat(req.body.price);
        writeDatabase(inventory);
        res.json(item);
    } else {
        res.status(404).send("Item not found");
    }
});

app.delete('/items/:id', (req, res) => {
    let inventory = readDatabase();
    const id = parseInt(req.params.id);
    inventory = inventory.filter(i => i.id !== id);
    writeDatabase(inventory);
    res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});