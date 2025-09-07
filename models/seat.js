const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: true
    },
    showtimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime', // Reference to the Showtime model
        required: true
    }
});

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;