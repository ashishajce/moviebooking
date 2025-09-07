const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const login = require('../../../models/login.js'); // This is your user model
const bookingModel = require('../../../models/booking.js');
const Movie = require('../../../models/movie.js');
const Theater = require('../../../models/theatre.js');
const Showtime = require('../../../models/showtime.js');



const router = express.Router();
const { isuser } = require('../../../controllers/middleware');

// -------------------- User Registration --------------------
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phonenumber } = req.body;

        if (!name || !email || !password || !phonenumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email is already registered
        const existingUser = await login.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new login({
            name,
            email,
            password: hashedPassword,
            phonenumber,
            role: 'user',
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// -------------------- User Login --------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = await login.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, 'mysecretkey123', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// -------------------- Auth Middleware --------------------
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'mysecretkey123');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// -------------------- Get User Profile --------------------
router.get('/profile', isuser, async (req, res) => {
    try {
        const user = await login.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// -------------------- Update User Profile --------------------
router.put('/profile', authenticate, async (req, res) => {
    try {
        const updates = req.body;

        const user = await login.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

const emailsend = require('../../../controllers/email'); // make sure path is correct

router.post('/user/bookticket', isuser, async (req, res) => {
    try {
        const userId = req.user._id;
        const { showtimeId, seats, totalPrice } = req.body;

        // Validate inputs
        if (!showtimeId || !seats || !totalPrice) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }

        const booking = new bookingModel({
            userId,
            showtimeId,
            seats,
            totalPrice
        });

        await booking.save();

        // Fetch user email and name from req.user
        const userEmail = req.user.email;
        const userName = req.user.name;

        // Send email
        const emailContent = `
Hello ${userName},

Your movie ticket booking is confirmed!

Details:
Name: ${userName}
Seats: ${seats}
Total Price: ₹${totalPrice}

Enjoy your movie!
`;

        await emailsend.sendTestEmail(userEmail, 'Ticket Booking Confirmation', emailContent);

        res.status(200).json({
            status: true,
            message: "Ticket booked successfully. A confirmation email has been sent.",
            booking
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});


module.exports = router;


