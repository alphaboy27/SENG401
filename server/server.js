const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import User model
require('dotenv').config({ path: '../.env' });

const app = express();

// Configure middleware and connect to MongoDB...

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        console.log('Received signup request:', req.body); // Log the received request body

        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            console.log('User already exists:', existingUser); // Log the existing user
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        console.log('User registered successfully:', newUser); // Log the newly registered user

        // Generate JWT token for the new user
        const token = jwt.sign(
            { userId: newUser._id.toString() }, // Ensure to convert _id to string
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send the token along with the success message
        res.status(201).json({
            message: 'User registered successfully',
            token: token // Include the generated token in the response
        });
    } catch (error) {
        console.error('Error registering user:', error); // Log any errors that occur
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('Received login request:', req.body);
        console.log('Found user:', user);

        // Check password
        const validPassword = await bcrypt.compare(req.body.password, user.password);

        console.log('Hashed password from database:', user.password);
        console.log('Hashed password from request:', req.body.password);

        if (!validPassword) {
            console.log('Password is valid:', validPassword);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id.toString() }, // Convert ObjectId to string
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Log successful token generation
        console.log('Generated token:', token);

        res.json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                // Include any other user details you wish to return, but exclude the password
            },
            token: token // Include the token here
        });
    } catch (error) {
        // Log the error object
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Define route handler for GET request to /api/signup
app.get('/api/signup', (req, res) => {
    // Handle GET request here
    // For example, you can send back a JSON response or render a template
    res.json({ message: 'GET request to /api/signup received' });
});

// Protected route example
app.get('/api/profile', verifyToken, (req, res) => {
    res.json({ message: 'Welcome to your profile' });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        next();
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
