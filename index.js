const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔴 PASTE YOUR REAL MONGODB LINK HERE
// (Make sure to replace <password> and check the cluster address!)
const MONGO_URI = "mongodb+srv://jerikoykoy_db_user:admin2026@cluster0.wahy7zh.mongodb.net/?appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve html files

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- DATA MODELS ---

const Item = mongoose.model('Item', new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
}));

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    equipmentName: String,
    borrower: String,
    purpose: String,
    date: String,
    status: String
}));

// --- ROUTES ---

// 1. LOGIN (Security Route)
app.post('/login', (req, res) => {
    const { password } = req.body;
    
    // Check password on the server
    if (password === "admin2026") { 
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// 2. Inventory Routes
app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

app.post('/items', async (req, res) => {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
});

// 3. Transaction Routes
app.get('/transactions', async (req, res) => {
    const logs = await Transaction.find().sort({ _id: -1 });
    res.json(logs);
});

app.post('/borrow', async (req, res) => {
    const { itemId, borrower, purpose } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item || item.quantity < 1) {
        return res.status(400).json({ error: "Item not available" });
    }

    item.quantity -= 1;
    await item.save();

    const newTrans = new Transaction({
        equipmentName: item.name,
        borrower: borrower,
        purpose: purpose,
        date: new Date().toLocaleDateString(),
        status: 'Released'
    });
    await newTrans.save();

    res.json(newTrans);
});

app.post('/return/:id', async (req, res) => {
    const trans = await Transaction.findById(req.params.id);
    if (trans.status === 'Returned') return res.json(trans);

    const item = await Item.findOne({ name: trans.equipmentName });
    if (item) {
        item.quantity += 1;
        await item.save();
    }

    trans.status = 'Returned';
    await trans.save();
    
    res.json(trans);
});

// --- FORCE PAGES (Helps with Render routing) ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// --- START SERVER (Only Once!) ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});