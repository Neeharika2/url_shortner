const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./connect');

const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');
const {restrictToLoggedIn, checkForAuthentication} = require('./middleware/auth');

const app = express();
const port = 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use('/url', restrictToLoggedIn, urlRoute);
app.use('/user', userRoute);
app.use("/", staticRoute);

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.get('/:shortId', async (req, res) => {
    const shortID = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortUrl: shortID
        },
        {
            $push: { visited: { timestamp: Date.now() } }
        }
    );
    if (!entry) {
        return res.status(404).send('Short URL not found');
    }
    res.redirect(entry.originalUrl);
})


connectDB("mongodb://localhost:27017/short-url")
.then (() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});



app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));