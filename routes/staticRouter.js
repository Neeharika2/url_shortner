const express = require('express');
const { generateShortUrl, getUrlsByUserId } = require('../controllers/url');
const { restrictToLoggedIn } = require('../middleware/auth');
const URL = require('../models/url');
const router = express.Router();


router.get('/', async (req, res) => {
    if (!req.user) {
        return res.render('home', {
            urls: [],
            user: null,
            shortUrl: null
        });
    }
    
    const urls = await URL.find({createdBy: req.user._id}).sort({ createdAt: -1 });
    const urlsWithAnalytics = urls.map(url => ({
        shortUrl: `http://localhost:8001/${url.shortUrl}`,
        originalUrl: url.originalUrl,
        clicks: url.visited.length,
        createdAt: url.createdAt
    }));
    
    return res.render('home', {
        urls: urlsWithAnalytics,
        user: req.user,
        shortUrl: req.query.shortUrl || null
    });
});


router.post('/', restrictToLoggedIn, async (req, res) => {
    try {
        const result = await generateShortUrl(req, res, true);
        if (result) {
            return res.redirect(`/?shortUrl=${encodeURIComponent(result.shortUrl)}`);
        } else {
            return res.redirect('/?error=1');
        }
    } catch (error) {
        return res.redirect('/?error=1');
    }
});

router.get('/signup', (req, res) => {
    return res.render("signup");
});

router.get('/login', (req, res) => {
    return res.render("login");
});

module.exports = router;