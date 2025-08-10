const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Razorpay = require('razorpay');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Food Item Schema
const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isSoldOut: { type: Boolean, default: false }, // New field for sold out status
    isDailySpecial: { type: Boolean, default: false } // New field for daily special
});
const FoodItem = mongoose.model('FoodItem', foodItemSchema);

// User Schema for authentication
const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    isStaff: { type: Boolean, default: false } // To differentiate between staff and users
});
const User = mongoose.model('User', userSchema);

// Order Schema for tracking
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    items: [{
        name: String,
        quantity: Number,
        price: Number
    }],
    status: {
        type: String,
        enum: ['Received', 'Preparing', 'Ready', 'Completed'],
        default: 'Received'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Razorpay setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // In a real app, use environment variables

// API Routes

// User and Admin Login
app.post('/api/login', async (req, res) => {
    const { username, password, phoneNumber } = req.body;
    if (username && password) {
        // Admin login
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            return res.json({ role: 'admin' });
        }
    } else if (phoneNumber) {
        // User login
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            user = new User({ phoneNumber });
            await user.save();
        }
        return res.json({ role: 'user', userId: user._id });
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

// Route to get all food items
app.get('/api/food-items', async (req, res) => {
    try {
        const items = await FoodItem.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching food items' });
    }
});

// Route to create a Razorpay order
app.post('/api/create-order', async (req, res) => {
    const { amount, items, userId } = req.body;
    try {
        const order = await razorpay.orders.create({
            amount: amount,
            currency: 'INR',
            receipt: 'receipt#1',
            payment_capture: 1,
        });

        const newOrder = new Order({
            orderId: order.id,
            items: items,
            user: userId,
            status: 'Received'
        });
        await newOrder.save();

        res.json({ order_id: order.id });
    } catch (err) {
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Route for users to track their order status
app.get('/api/order-status/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ status: order.status });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching order status' });
    }
});

// Route for the admin to update an order's status
app.put('/api/admin/update-order-status/:orderId', async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findOneAndUpdate({ orderId: req.params.orderId }, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// Admin route to add a new food item
app.post('/api/add-item', async (req, res) => {
    try {
        const newItem = new FoodItem(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: 'Error adding food item' });
    }
});

// Admin route to delete a food item
app.delete('/api/delete-item/:id', async (req, res) => {
    try {
        await FoodItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting food item' });
    }
});

// Admin route to update a food item
app.put('/api/update-item/:id', async (req, res) => {
    try {
        const updatedItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: 'Error updating food item' });
    }
});

// Admin route to set a daily special
app.put('/api/set-daily-special/:id', async (req, res) => {
    try {
        await FoodItem.updateMany({}, { isDailySpecial: false }); // Reset all other specials
        const specialItem = await FoodItem.findByIdAndUpdate(req.params.id, { isDailySpecial: true }, { new: true });
        res.status(200).json(specialItem);
    } catch (err) {
        res.status(400).json({ message: 'Error setting daily special' });
    }
});

// NEW ROUTE TO FETCH LIVE ORDERS
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find({ status: { $ne: 'Completed' } });
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));