const express = require('express');
const {
    getAllRides,
    searchRides,
    createRide,
    getUserRides,
    getUserBookings,
    bookRide,
    deleteRide,
    addReview,
    cancelBooking
} = require('../controllers/rideController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/rides
// @desc    Get all rides (admin only)
// @access  Private/Admin
router.get('/', adminAuth, getAllRides);

// @route   GET /api/rides/search
// @desc    Search available rides
// @access  Private
router.get('/search', auth, searchRides);

// @route   POST /api/rides
// @desc    Create a new ride
// @access  Private
router.post('/', auth, createRide);

// @route   GET /api/rides/my-rides
// @desc    Get user's created rides
// @access  Private
router.get('/my-rides', auth, getUserRides);

// @route   GET /api/rides/my-bookings
// @desc    Get user's bookings
// @access  Private
router.get('/my-bookings', auth, getUserBookings);

// @route   POST /api/rides/:id/book
// @desc    Book a ride
// @access  Private
router.post('/:id/book', auth, bookRide);

// @route   DELETE /api/rides/:id
// @desc    Delete ride
// @access  Private
router.delete('/:id', auth, deleteRide);

// @route   POST /api/rides/:id/review
// @desc    Add review to ride
// @access  Private
router.post('/:id/review', auth, addReview);

// @route   POST /api/rides/:id/cancel
// @desc    Cancel booking
// @access  Private
router.post('/:id/cancel', auth, cancelBooking);

module.exports = router;
