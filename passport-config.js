const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const bcrypt = require('bcrypt');

const authenticateUser = (email, password, done) => {
    console.log("Authenticating user...")
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log("No account associated with that email");
                return done(null, false, { message: "No account associated with that email" });
            } else {
                console.log("Validating user's password...")
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.log("Erroring logging in user:", err);
                        throw err;
                    };
                    if (isMatch) {
                        console.log("Password validated for user", user)
                        return done(null, {_id: user._id, publicAccount: user.publicAccount});
                    } else {
                        return done(null, false, { message: "Wrong password" });
                    }
                });
            }
        })
        .catch(err => {
            return done(err, false, { message: err });
        });
}

passport.serializeUser((user, done) => {
    console.log("serialize user:", user)
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, {_id: user._id, publicAccount: user.publicAccount});
    });
});

passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))

module.exports = passport;