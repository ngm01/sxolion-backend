require('dotenv').config();
const express = require('express')
const app = express();
const passport = require('./passport-config');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const store = new MongoStore({mongooseConnection: mongoose.connection});

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true})
        .then(console.log("Connected to db"))
        .catch(err => console.log("Error connecting to db:", err));


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store})
);
app.use(passport.initialize());
app.use(passport.session());

const apiRouter = express.Router();
const userRoutes = require('./routes/user');
const containerRoutes = require('./routes/container');
const itemRoutes = require('./routes/item');

app.use('/api', apiRouter);
apiRouter.use('/user', userRoutes);
apiRouter.use('/container', containerRoutes);
apiRouter.use('/item', itemRoutes);

app.listen(3000);