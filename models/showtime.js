const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    screen: { type: String, required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Showtime', showtimeSchema);
