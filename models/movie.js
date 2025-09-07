const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: String,
    description: String,
    genre: String,
    duration: Number,
    releaseDate: Date,
    language: String,
    rating: Number
});

module.exports = mongoose.model('Movie', movieSchema);
