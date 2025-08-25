const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isSoldOut: { type: Boolean, default: false },
    isDailySpecial: { type: Boolean, default: false }
});
const FoodItem = mongoose.model('FoodItem', foodItemSchema);

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    department: String,
    studentId: String,
    email: String,
    phoneNumber: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cart: { type: Object, default: {} } // 👈 NEW: Added cart field to the user schema
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customOrderId: { type: String, required: true, unique: true },
    tokenNumber: { type: Number },
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        category: String
    }],
    userName: String,
    userRollNo: String,
    pickupTime: String,
    status: {
        type: String,
        enum: ['Received', 'Preparing', 'Ready', 'Completed'],
        default: 'Received'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    qrCodeToken: { type: String, unique: true, sparse: true },
    qrCodeScanned: { type: Boolean, default: false },
    extraSuggestions: { type: String } // NEW: Added for extra suggestions
});
const Order = mongoose.model('Order', orderSchema);

const dailyTokenSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, required: true },
    lastToken: { type: Number, default: 0 }
});
const DailyToken = mongoose.model('DailyToken', dailyTokenSchema);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

async function initializeData() {
    const count = await FoodItem.countDocuments();
    if (count === 0) {
        const staticFoodItems = [
            { name: 'Pazhampori', price: 14, image: 'pazhampori.jpg', category: 'Snacks' },
            { name: 'Vettu Cake', price: 15, image: 'vettu-cake.jpg', category: 'Snacks' },
            { name: 'Pathiri', price: 12, image: 'pathiri.jpg', category: 'Snacks' },
            { name: 'Kozhukkata', price: 20, image: 'kozhukkata.jpg', category: 'Snacks' },
            { name: 'Ada', price: 20, image: 'ada.jpg', category: 'Snacks' },
            { name: 'Veg Roll', price: 30, image: 'veg-roll.jpg', category: 'Snacks' },
            { name: 'Vada', price: 12, image: 'vada.jpg', category: 'Snacks' },
            { name: 'Cream Bun', price: 25, image: 'cream-bun.jpg', category: 'Snacks' },
            { name: 'Donut', price: 30, image: 'donut.jpg', category: 'Snacks' },
            { name: 'Pink Donut', price: 30, image: 'pink-donut.jpg', category: 'Snacks' },
            { name: 'Maggi Noodles', price: 50, image: 'maggi.jpg', category: 'Snacks' },
            { name: 'Masala Dosa', price: 90, image: 'masala-dosa.jpg', category: 'Snacks' },
            { name: 'Samosa', price: 25, image: 'samosa.jpg', category: 'Snacks' },
            { name: 'Veg Sandwich', price: 60, image: 'veg-sandwich.jpg', category: 'Snacks' },
            { name: 'Coffee', price: 14, image: 'coffee.jpg', category: 'Beverages' },
            { name: 'Tea', price: 14, image: 'tea.jpg', category: 'Beverages' },
            { name: 'Cold Coffee', price: 40, image: 'cold-coffee.jpg', category: 'Cold Beverages' },
            { name: 'Boost', price: 20, image: 'boost.jpg', category: 'Beverages' },
            { name: 'Orange Juice', price: 30, image: 'orange-juice.jpg', category: 'Juice' },
            { name: 'Mango Juice', price: 35, image: 'mango-juice.jpg', category: 'Juice' },
            { name: 'Watermelon Fresh Juice', price: 40, image: 'watermelon-fresh-juice.jpg', category: 'Fresh Juice' },
            { name: 'Strawberry Shake', price: 50, image: 'strawberry-shake.jpg', category: 'Shake' },
            { name: 'Chocolate Shake', price: 55, image: 'chocolate-shake.jpg', category: 'Shake' },
            { name: 'Porotta', price: 10, image: 'porotta.jpg', category: 'Staples' },
            { name: 'Butter Naan', price: 20, image: 'butter-naan.jpg', category: 'Staples' },
            { name: 'Bhatura', price: 20, image: 'bhatura.jpg', category: 'Staples' },
            { name: 'Paneer Butter Masala', price: 100, image: 'paneer-butter-masala.jpg', category: 'Curries' },
            { name: 'Chicken Biryani', price: 150, image: 'biryani.jpg', category: 'Meals' },
        ];
        await FoodItem.insertMany(staticFoodItems);
        console.log('Initial food items populated.');
    }
}
initializeData();

app.post('/api/login', async (req, res) => {
    const { username, password, phoneNumber } = req.body;
    if (username && password) {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            return res.json({ role: 'admin' });
        }
    } else if (phoneNumber) {
        const user = await User.findOne({ phoneNumber });
        if (user) {
            return res.json({ role: 'user', userId: user._id });
        } else {
            return res.status(404).json({ message: 'User not found. Please sign up.' });
        }
    }
    res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/admin/forgot-password', (req, res) => {
    res.json({ message: 'A password reset link has been sent to the admin email.' });
});

app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, department, studentId, email, phoneNumber } = req.body;

    try {
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            if (existingUser.firstName && existingUser.lastName) {
                return res.status(409).json({ success: false, message: 'User with this phone number already exists.' });
            } else {
                const updatedUser = await User.findByIdAndUpdate(
                    existingUser._id,
                    { firstName, lastName, department, studentId, email },
                    { new: true }
                );
                return res.status(200).json({ success: true, message: 'Profile updated successfully.', userId: updatedUser._id });
            }
        }

        const newUser = new User({ firstName, lastName, department, studentId, email, phoneNumber });
        await newUser.save();

        res.status(201).json({ success: true, message: 'User signed up successfully.', userId: newUser._id });
    } catch (error) {
        console.error('Sign up error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during sign up.' });
    }
});

// ----------------------------------------
// 👇 NEW API ENDPOINTS FOR CART PERSISTENCE
// ----------------------------------------

// Endpoint to save the user's cart to the database
app.post('/api/save-cart', async (req, res) => {
    const { userId, cart } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.cart = cart;
        await user.save();
        res.status(200).json({ success: true, message: 'Cart saved successfully.' });
    } catch (error) {
        console.error('Error saving cart:', error);
        res.status(500).json({ message: 'Server error while saving cart.' });
    }
});

// Endpoint to load the user's cart from the database
app.get('/api/load-cart/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user.cart || {}); // Return the cart or an empty object if no cart is found
    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).json({ message: 'Server error while loading cart.' });
    }
});

// ----------------------------------------
// 👆 END OF NEW API ENDPOINTS
// ----------------------------------------


app.get('/api/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Error fetching user profile.' });
    }
});

app.put('/api/user/:userId', async (req, res) => {
    const { firstName, lastName, department, studentId, email } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { firstName, lastName, department, studentId, email },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ message: 'Error updating user profile.' });
    }
});

app.get('/api/food-items', async (req, res) => {
    try {
        const items = await FoodItem.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching food items' });
    }
});

app.post('/api/create-order', async (req, res) => {
    const { amount, items, userId, userName, userRollNo, pickupTime, extraSuggestions } = req.body; // NEW: Added extraSuggestions
    try {
        let dailyToken = await DailyToken.findOne();
        const today = new Date().toISOString().split('T')[0];
        
        if (!dailyToken || dailyToken.date.toISOString().split('T')[0] !== today) {
            dailyToken = await DailyToken.findOneAndUpdate(
                {},
                { date: new Date(), lastToken: 0 },
                { new: true, upsert: true }
            );
        }

        let newToken = dailyToken.lastToken + 1;
        if (newToken > 3000) {
            newToken = 1;
        }
        dailyToken.lastToken = newToken;
        await dailyToken.save();
        
        const order = await razorpay.orders.create({
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
        });

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let customOrderId = '';
        for (let i = 0; i < 6; i++) {
            customOrderId += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        const qrCodeToken = crypto.randomBytes(16).toString('hex');

        const newOrder = new Order({
            orderId: order.id,
            customOrderId: customOrderId,
            tokenNumber: newToken,
            items: items,
            user: userId,
            userName,
            userRollNo,
            pickupTime,
            status: 'Received',
            qrCodeToken: qrCodeToken,
            qrCodeScanned: false,
            extraSuggestions: extraSuggestions, // NEW: Added extraSuggestions to the new order
        });
        await newOrder.save();
        
        // Clear the user's cart in the database after a successful order
        await User.findByIdAndUpdate(userId, { cart: {} });
        console.log(`User ${userId}'s cart cleared after successful order.`);


        res.json({
            order_id: order.id,
            qrCodeToken: qrCodeToken,
            custom_order_id: customOrderId,
            tokenNumber: newToken,
        });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Error creating order' });
    }
});

app.get('/api/order-status/:customOrderId', async (req, res) => {
    try {
        const order = await Order.findOne({ customOrderId: req.params.customOrderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching order status' });
    }
});

app.get('/api/user-active-orders/:userId', async (req, res) => {
    try {
        const activeOrder = await Order.findOne({ user: req.params.userId, status: { $in: ['Received', 'Preparing', 'Ready'] } }).sort({ createdAt: -1 });
        res.json(activeOrder);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching active order' });
    }
});

app.get('/api/user-orders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user orders' });
    }
});

app.get('/api/order/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching order details.' });
    }
});

app.put('/api/admin/update-order-status/:orderId', async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});

app.post('/api/admin/scan-qr', async (req, res) => {
    const { qrCodeToken } = req.body;
    try {
        const order = await Order.findOne({ qrCodeToken: qrCodeToken });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Invalid QR Code. Please check the code and try again.' });
        }
        
        if (order.status === 'Completed' || order.qrCodeScanned) {
            return res.status(400).json({ success: false, message: 'Order has already been picked up.' });
        }
        
        const isPremadeOnlyOrder = order.items.every(item => 
            item.category === 'Snacks' || item.category === 'Beverages' || item.category === 'Juice'
        );

        if (isPremadeOnlyOrder) {
            order.status = 'Completed';
            order.qrCodeScanned = true;
        } else if (order.status === 'Ready') {
            order.status = 'Completed';
            order.qrCodeScanned = true;
        } else {
            return res.status(400).json({ success: false, message: 'Order is not ready for pickup.' });
        }
        
        await order.save();

        res.json({ success: true, message: 'Order Confirmed and Picked Up', order });
    } catch (err) {
        console.error('QR code scanning failed:', err);
        res.status(500).json({ success: false, message: 'Server error during QR code validation.' });
    }
});

app.post('/api/add-item', async (req, res) => {
    try {
        const newItem = new FoodItem(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: 'Error adding food item' });
    }
});

app.delete('/api/delete-item/:id', async (req, res) => {
    try {
        await FoodItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting food item' });
    }
});

app.put('/api/update-item/:id', async (req, res) => {
    try {
        const updatedItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: 'Error updating food item' });
    }
});

app.put('/api/set-daily-special/:id', async (req, res) => {
    try {
        const specialItem = await FoodItem.findByIdAndUpdate(req.params.id, { isDailySpecial: true }, { new: true });
        res.status(200).json(specialItem);
    } catch (err) {
        res.status(400).json({ message: 'Error unsetting daily special' });
    }
});

app.put('/api/unset-daily-special/:id', async (req, res) => {
    try {
        const specialItem = await FoodItem.findByIdAndUpdate(req.params.id, { isDailySpecial: false }, { new: true });
        res.status(200).json(specialItem);
    } catch (err) {
        res.status(400).json({ message: 'Error unsetting daily special' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find({ status: { $in: ['Received', 'Preparing', 'Ready'] } }).sort({ createdAt: 1 });
        
        const trackableOrders = orders.filter(order => {
            const hasNonPremadeItem = order.items.some(item => 
                item.category !== 'Snacks' && item.category !== 'Beverages' && item.category !== 'Juice'
            );
            return hasNonPremadeItem;
        });

        res.json(trackableOrders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
