const express = require('express');
const { userSignUp, userLogin }  = require('../controllers/user');
const { deleteUser } = require('../service/auth');
const router = express.Router();

router.post('/', userSignUp); 
router.post('/login', userLogin);

router.get('/logout', (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
        deleteUser(sessionId);
        res.clearCookie('sessionId');
    }
    res.redirect('/');
});

module.exports = router;