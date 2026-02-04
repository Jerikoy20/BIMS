const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔴 PASTE YOUR MONGODB CONNECTION STRING HERE 🔴
// It should look like: mongodb+srv://admin:password...
const MONGO_URI = "mongodb+srv://jerikoykoy:<admin123>@cluster0.wahy7zh.mongodb.net/?appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 1. CONNECT TO MONGODB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// 2. DEFINE THE DATA STRUCTURE (Schema)
const ItemSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
});

const Item = mongoose.model('Item', ItemSchema);

// --- API ROUTES ---

// GET all items
app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

// ADD item
app.post('/items', async (req, res) => {
    const newItem = new Item({
        name: req.body.name,
        quantity: parseInt(req.body.quantity),
        price: parseFloat(req.body.price)
    });
    await newItem.save(); // Saves to the Cloud!
    res.json(newItem);
});

// UPDATE item
app.put('/items/:id', async (req, res) => {
    const { id } = req.params;
    const updatedItem = await Item.findByIdAndUpdate(id, {
        name: req.body.name,
        quantity: parseInt(req.body.quantity),
        price: parseFloat(req.body.price)
    }, { new: true });
    res.json(updatedItem);
});

// DELETE item
app.delete('/items/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});