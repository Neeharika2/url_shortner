const shortid = require('shortid');
const URL = require('../models/url');

async function generateShortUrl(req, res, isWebForm = false) {
    const body = req.body;
    if (!body || !body.originalUrl) {
        if (isWebForm) {
            return null;
        }
        return res.status(400).json({ error: 'Original URL is required' });
    }

    const shortId = shortid();

    try {
        const result = await URL.create({
            originalUrl: req.body.originalUrl,
            shortUrl: shortId,
            visited: [],
            createdBy: req.user ? req.user._id : null
        });

        const shortUrl = `http://localhost:8001/${shortId}`;
        
        if (isWebForm) {
            return { shortUrl };
        }
        
        return res.status(201).json({ shortUrl });
    } catch (err) {
        if (isWebForm) {
            return null;
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getAnalytics(req, res) {
    const shortID = req.params.shortId;
    const result = await URL.findOne({ shortUrl: shortID });
    return res.json({totalClicks: result.visited.length, analytics: result.visited });
}

async function getAllUrls(req, res) {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const urls = await URL.find({ createdBy: userId }).sort({ createdAt: -1 });
    const urlsWithAnalytics = urls.map(url => ({
        shortUrl: `http://localhost:8001/${url.shortUrl}`,
        originalUrl: url.originalUrl,
        clicks: url.visited.length,
        createdAt: url.createdAt
    }));
    return res.json(urlsWithAnalytics);
}

async function getUrlsByUserId(userId) {
    if (!userId) {
        return [];
    }
    const urls = await URL.find({ createdBy: userId }).sort({ createdAt: -1 });
    const urlsWithAnalytics = urls.map(url => ({
        shortUrl: `http://localhost:8001/${url.shortUrl}`,
        originalUrl: url.originalUrl,
        clicks: url.visited.length,
        createdAt: url.createdAt
    }));
    return urlsWithAnalytics;
}

module.exports = {
    generateShortUrl,
    getAnalytics,
    getAllUrls,
    getUrlsByUserId,
};