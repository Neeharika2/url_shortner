const { getUser } = require('../service/auth');

async function restrictToLoggedIn(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
        return res.redirect('/login');
    }
    
    const user = getUser(sessionId);
    if (!user) {
        return res.redirect('/login');
    }
    
    req.user = user;
    next();
}

async function checkForAuthentication(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId) {
        const user = getUser(sessionId);
        req.user = user;
    }
    
    next();
}

module.exports = {
    restrictToLoggedIn,
    checkForAuthentication,
};