const {v4: uuidv4} = require('uuid');
const {setUser} = require('../service/auth');
const User = require('../models/user');
const { getUrlsByUserId } = require('./url');

async function userSignUp(req, res) {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
    }
 
    const newUser = await User.create({
        username,
        password, 
        email
    });

    if (newUser.code === 11000) {
        return res.status(400).json({ error: 'Username or email already exists' });
    }

    if (!newUser) {
        return res.status(500).json({ error: 'Failed to create account' });
    }

    const sessionId = uuidv4(); 
    setUser(sessionId, { 
        _id: newUser._id,
        username: newUser.username, 
        email: newUser.email 
    });
    res.cookie('sessionId', sessionId);

    const urls = await getUrlsByUserId(newUser._id);
    return res.render("home", { 
        shortUrl: null, 
        urls,
        user: { username: newUser.username, _id: newUser._id },
        message: "Account created successfully! Welcome to URL Shortener."
    });
}

async function userLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render("login", { error: 'Username and password are required' });
    }

    const user = await User.findOne({
        $or: [
            { username: username },
            { email: username }
        ]
    });

    if (!user) {
        return res.render("login", { error: 'Invalid username or password' });
    }

    if (user.password !== password) {
        return res.render("login", { error: 'Invalid username or password' });
    }

    const sessionId = uuidv4(); 
    setUser(sessionId, { 
        _id: user._id,
        username: user.username, 
        email: user.email 
    });
    res.cookie('sessionId', sessionId);

    const urls = await getUrlsByUserId(user._id);
    return res.render("home", { 
        shortUrl: null, 
        urls,
        user: { username: user.username, _id: user._id },
        message: `Welcome back, ${user.username}!`
    });
}

module.exports = {
    userSignUp,
    userLogin
};