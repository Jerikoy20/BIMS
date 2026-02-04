const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔴 PASTE YOUR MONGODB LINK HERE (With the password!)
const MONGO_URI = "mongodb+srv://admin:bims2026@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- DATA MODELS ---

// 1. Equipment Inventory
const Item = mongoose.model('Item', new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
}));

// 2. Borrowing Transactions (NEW!)
const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    equipmentName: String,
    borrower: String,
    purpose: String,
    date: String,
    status: String // 'Released' or 'Returned'
}));

// --- API ROUTES ---

// Get Inventory
app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

// Add Inventory
app.post('/items', async (req, res) => {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
});

// Delete Inventory
app.delete('/items/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// --- NEW TRANSACTION ROUTES ---

// Get All Requests (For the Table)
app.get('/transactions', async (req, res) => {
    const logs = await Transaction.find().sort({ _id: -1 }); // Newest first
    res.json(logs);
});

// Borrow an Item (Create Transaction)
app.post('/borrow', async (req, res) => {
    const { itemId, borrower, purpose } = req.body;
    
    // 1. Find the item
    const item = await Item.findById(itemId);
    if (!item || item.quantity < 1) {
        return res.status(400).json({ error: "Item not available" });
    }

    // 2. Decrease Quantity
    item.quantity -= 1;
    await item.save();

    // 3. Create Receipt
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

// Return an Item
app.post('/return/:id', async (req, res) => {
    // 1. Find the transaction
    const trans = await Transaction.findById(req.params.id);
    if (trans.status === 'Returned') return res.json(trans);

    // 2. Find the original item and increase quantity
    const item = await Item.findOne({ name: trans.equipmentName });
    if (item) {
        item.quantity += 1;
        await item.save();
    }

    // 3. Mark as Returned
    trans.status = 'Returned';
    await trans.save();
    
    res.json(trans);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});