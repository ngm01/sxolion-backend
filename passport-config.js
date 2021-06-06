const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const bcrypt = require('bcrypt');

const authenticateUser = (email, password, done) => {
    console.log("Authenticating user...")
    console.log("email:", email)
    console.log("password:", password)
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log("No account associated with that email");
                return done(null, false, { message: "No account associated with that email" });
            } else {
                console.log("Logging in user...")
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.log("Erroring logging in user:", err);
                        throw err;
                    };
                    if (isMatch) {
                        return done(null, user);
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
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))

module.exports = passport;