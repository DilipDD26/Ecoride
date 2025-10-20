const express = require('express');
const {
    getAllRides,
    searchRides,
    createRide,
    getUserRides,
    getUserBookings,
    bookRide,
    acceptBooking,
    rejectBooking,
    completeRide,
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
// @desc    Search available rides with nearby matches
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
// @desc    Book a ride (creates pending request)
// @access  Private
router.post('/:id/book', auth, bookRide);

// @route   POST /api/rides/:id/accept
// @desc    Accept a booking request (driver only)
// @access  Private
router.post('/:id/accept', auth, acceptBooking);

// @route   POST /api/rides/:id/reject
// @desc    Reject a booking request (driver only)
// @access  Private
router.post('/:id/reject', auth, rejectBooking);

// @route   POST /api/rides/:id/complete
// @desc    Mark ride as completed (driver only)
// @access  Private
router.post('/:id/complete', auth, completeRide);

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
