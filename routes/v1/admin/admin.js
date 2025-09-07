const express = require('express');
const jwt = require('jsonwebtoken');
const hash=require('bcrypt');
const router = express.Router();
const Movie = require('../../../models/movie.js');
const Theater = require('../../../models/theatre.js');
const Showtime = require('../../../models/showtime.js');
const Seat = require('../../../models/seat.js');
const isadmin=require('../../../controllers/middleware').isadmin;
const isuser=require('../../../controllers/middleware').isuser;



const login=require('../../../models/login');
const token=require('../../../models/token');

router.post('/v1/admin/register', async(req, res) => {

    try{

        console.log("ffff")
        

        const { name, phonenumber, email, password, role } = req.body;

        console.log(req.body);
console.log("ffffee")


if(!name || typeof name !== 'string' || name.trim() === ''|| name.trim().length < 2){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid name",
            });
        }
if(!phonenumber || typeof phonenumber !== 'number' || phonenumber <= 0){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid phone number",
            });
        }

if(!email || typeof email !== 'string' || !email.includes('@') || email.trim() === ''){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid email",
            });
        }
if(!password || typeof password !== 'string' || password.length < 6){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid password with at least 6 characters",
            });
        }
if(!role || (role !== 'admin' && role !== 'enduser' && role !== 'hotelowner')){
            return res.status(400).json({
                status:false,
                message:"Please select a valid role",
            });
        }
    

if(!name || !phonenumber || !email || !password || !role){
            return res.status(400).json({
                status:false,
                message:"Please fill all the fields",
            });
        }
        const hashedPassword = await hash.hash(password, 10);

    console.log("hello world");


    const newUser = new login({
        name: name,
        phonenumber: phonenumber,
        email: email,
        password: hashedPassword,
        role: role,
    })

    await newUser.save();
    

    res.status(201).json({
        status: true,
        message: "User registered successfully",
       
    })
}
    


    

    

    catch(err){
        console.error(err);
        res.status(500).json({
            status:false,
            message:"Something went wrong",
        });
        
    }


});


router.post('/v1/admin/login', async(req, res) => {
    try{

        const { email, password } = req.body;

        if(!email || typeof email !== 'string' || !email.includes('@') || email.trim() === ''){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid email",
            });
        }
        if(!password || typeof password !== 'string' || password.length < 6){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid password with at least 6 characters",
            });
        }

        const user = await login.findOne({ email: email });

        if(!user){
            return res.status(404).json({
                status:false,
                message:"User not found",
            });
        }

        const isMatch = await hash.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({
                status:false,
                message:"Invalid credentials",
            });
        }

        const tokenValue = jwt.sign({ id: user._id }, 'mysecretkey123', { expiresIn: '1h' });

        const newToken = new token({
            loginid: user._id,
            token: tokenValue,
        });

        await newToken.save();

        res.status(200).json({
            status:true,
            message:"Login successful",
            token: tokenValue,
            role: user.role,
            name: user.name
        });

    } 

catch(err) {
        console.error(err);
        res.status(500).json({
            status:false,
            message:"Something went wrong",
        });
    }
}

);


// Add a new movie
router.post('/movies', async (req, res) => {
    try {
        const { title, description, genre, duration, releaseDate, language, rating } = req.body;

        // Manual validation
        if (!title || !description || !genre || !duration || !releaseDate || !language || rating === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ error: 'Title must be a non-empty string' });
        }

        if (typeof duration !== 'number' || duration <= 0) {
            return res.status(400).json({ error: 'Duration must be a positive number' });
        }

        if (typeof rating !== 'number' || rating < 0 || rating > 10) {
            return res.status(400).json({ error: 'Rating must be between 0 and 10' });
        }

        const movie = new Movie({ title, description, genre, duration, releaseDate, language, rating });
        await movie.save();

        res.status(201).json({ message: 'Movie added successfully', movie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update movie details
router.put('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const movie = await Movie.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json({ message: 'Movie updated successfully', movie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Soft delete a movie
router.delete('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await Movie.findByIdAndUpdate(id, { deleted: true }, { new: true });

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json({ message: 'Movie soft deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Add a new showtime
router.post('/showtimes', async (req, res) => {
    try {
        const { movieId, theaterId, screen, startTime, price } = req.body;

        // Manual validation
        if (!movieId || !theaterId || !screen || !startTime || !price) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const movieExists = await Movie.findById(movieId);
        const theaterExists = await Theater.findById(theaterId);

        if (!movieExists) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        if (!theaterExists) {
            return res.status(404).json({ error: 'Theater not found' });
        }

        const showtime = new Showtime({ movieId, theaterId, screen, startTime, price });
        await showtime.save();

        res.status(201).json({ message: 'Showtime added successfully', showtime });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Soft delete a showtime
router.patch('/showtimes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const showtime = await Showtime.findByIdAndUpdate(id, { deleted: true }, { new: true });

        if (!showtime) {
            return res.status(404).json({ error: 'Showtime not found' });
        }

        res.status(200).json({ message: 'Showtime soft deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});







// Add a new theater
router.post('/theater', async (req, res) => {
    try {
        const { name, location, screens } = req.body;

        // Validate input
        if (!name || !location || !screens) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const theater = new Theater({ name, location, screens });
        await theater.save();

        res.status(201).json({ message: 'Theater added successfully', theater });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all theaters
router.get('/theater', async (req, res) => {
    try {
        const theaters = await Theater.find();
        res.status(200).json(theaters);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a theater by ID
router.get('/theater/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const theater = await Theater.findById(id);

        if (!theater) {
            return res.status(404).json({ error: 'Theater not found' });
        }

        res.status(200).json(theater);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a theater
router.put('/theater/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, screens } = req.body;

        const theater = await Theater.findByIdAndUpdate(
            id,
            { name, location, screens },
            { new: true, runValidators: true }
        );

        if (!theater) {
            return res.status(404).json({ error: 'Theater not found' });
        }

        res.status(200).json({ message: 'Theater updated successfully', theater });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Soft delete a theater
router.patch('/theater/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const theater = await Theater.findByIdAndUpdate(id, { deleted: true }, { new: true });

        if (!theater) {
            return res.status(404).json({ error: 'Theater not found' });
        }

        res.status(200).json({ message: 'Theater soft deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Add seats
// Add a seat for a specific showtime
router.post('/seats', async (req, res) => {
    try {
        const { seatNumber, price, showtimeId } = req.body;

        if (!seatNumber || price === undefined || !showtimeId) {
            return res.status(400).json({ error: 'seatNumber, price, and showtimeId are required' });
        }

        const seat = new Seat({
            seatNumber,
            price,
            showtimeId
        });

        await seat.save();

        res.status(201).json({ message: 'Seat added successfully', seat });
    } catch (error) {
        console.error('Seat creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;