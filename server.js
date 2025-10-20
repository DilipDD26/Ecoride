const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const rideRoutes = require('./routes/rides');
const notificationRoutes = require('./routes/notifications');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/signup.html'));
});

app.get('/dashboard-user', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/dashboard-user.html'));
});

app.get('/dashboard-admin', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/dashboard-admin.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
