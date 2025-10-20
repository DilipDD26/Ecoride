const Ride = require('../models/Ride');

const getAllRides = async (req, res) => {
    try {
        const rides = await Ride.find()
            .populate('driver', 'name email phone')
            .populate('passengers.user', 'name email phone')
            .populate('reviews.user', 'name')
            .sort({ createdAt: -1 });
        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchRides = async (req, res) => {
    try {
        const { from, to, date, minPrice, maxPrice, minSeats } = req.query;
        let query = { status: 'active', availableSeats: { $gt: 0 } };

        if (from) {
            query.from = { $regex: from, $options: 'i' };
        }
        if (to) {
            query.to = { $regex: to, $options: 'i' };
        }
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(searchDate.getDate() + 1);
            query.departureDate = { $gte: searchDate, $lt: nextDay };
        }
        if (minPrice || maxPrice) {
            query.pricePerSeat = {};
            if (minPrice) query.pricePerSeat.$gte = parseFloat(minPrice);
            if (maxPrice) query.pricePerSeat.$lte = parseFloat(maxPrice);
        }
        if (minSeats) {
            query.availableSeats = { $gte: parseInt(minSeats) };
        }

        const rides = await Ride.find(query)
            .populate('driver', 'name email phone')
            .populate('reviews.user', 'name')
            .sort({ departureDate: 1, departureTime: 1 });

        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const createRide = async (req, res) => {
    try {
        const { from, to, departureDate, departureTime, availableSeats, pricePerSeat, description } = req.body;

        const ride = new Ride({
            driver: req.user.id,
            from,
            to,
            departureDate,
            departureTime,
            availableSeats,
            pricePerSeat,
            description
        });

        await ride.save();
        await ride.populate('driver', 'name email phone');
        
        res.status(201).json(ride);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserRides = async (req, res) => {
    try {
        const rides = await Ride.find({ driver: req.user.id })
            .populate('passengers.user', 'name email phone')
            .populate('reviews.user', 'name')
            .sort({ createdAt: -1 });
        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const rides = await Ride.find({ 'passengers.user': req.user.id })
            .populate('driver', 'name email phone')
            .populate('passengers.user', 'name email phone')
            .populate('reviews.user', 'name')
            .sort({ departureDate: 1 });
        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const bookRide = async (req, res) => {
    try {
        const { seats = 1 } = req.body;
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.driver.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot book your own ride' });
        }

        if (ride.availableSeats < seats) {
            return res.status(400).json({ message: 'Not enough available seats' });
        }

        // Check if user already booked this ride
        const existingBooking = ride.passengers.find(p => p.user.toString() === req.user.id);
        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked this ride' });
        }

        ride.passengers.push({
            user: req.user.id,
            bookedSeats: seats
        });
        ride.availableSeats -= seats;

        await ride.save();
        await ride.populate('driver', 'name email phone');
        await ride.populate('passengers.user', 'name email phone');

        res.json(ride);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if user is the driver or admin
        if (ride.driver.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Ride.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ride deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if user was a passenger on this ride
        const wasPassenger = ride.passengers.some(p => p.user.toString() === req.user.id);
        if (!wasPassenger) {
            return res.status(403).json({ message: 'Only passengers can review this ride' });
        }

        // Check if user already reviewed
        const existingReview = ride.reviews.find(r => r.user.toString() === req.user.id);
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this ride' });
        }

        ride.reviews.push({
            user: req.user.id,
            rating,
            comment
        });

        // Calculate average rating
        const totalRating = ride.reviews.reduce((sum, review) => sum + review.rating, 0);
        ride.averageRating = totalRating / ride.reviews.length;

        await ride.save();
        await ride.populate('reviews.user', 'name');

        res.json(ride);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        const bookingIndex = ride.passengers.findIndex(p => p.user.toString() === req.user.id);
        if (bookingIndex === -1) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = ride.passengers[bookingIndex];
        ride.availableSeats += booking.bookedSeats;
        ride.passengers.splice(bookingIndex, 1);

        await ride.save();
        await ride.populate('driver', 'name email phone');
        await ride.populate('passengers.user', 'name email phone');
        await ride.populate('reviews.user', 'name');
        
        res.json({ message: 'Booking cancelled successfully', ride });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllRides,
    searchRides,
    createRide,
    getUserRides,
    getUserBookings,
    bookRide,
    deleteRide,
    addReview,
    cancelBooking
};
