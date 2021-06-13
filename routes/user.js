const express = require('express');
const passport = require('../passport-config');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const userRoutes = express.Router();

userRoutes.post('/register', 
(req, res) => {
    let {email, password} = req.body;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log("Registering new user...");
                const newUser = new User({ email, password });
                // Hash password before saving in database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.status(200).json({message: "Registration successful"});
                            })
                            .catch(err => {
                                console.log("Error registering user:", err);
                                res.status(500).json({message: "Error registering user", err})
                            });
                    });
                });
            } else {
                console.log("User with that email already exists");
                res.status(409).json({message: "User with that email already exists"});

            }
        })
        .catch(err => {
            res.status(500).json({message: "Error registering user:", err})
        });
})

userRoutes.post('/login', (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
        if(err){
            return res.status(400).json({message: "Error attempting to login user", err});
        }
        if(!user){
            return res.status(404).json({message: "user not found"});
        }
        req.login(user, function(err){
            console.log("req.login route user obj:", user);
            if(err){
                console.log("Error attempting to log in user:", err);
                return res.status(400).json({message: "Error attempting to login user", err});
            }
            return res.status(200).json({message: "logged in user", user})
        })
    })(req, res, next);
})

userRoutes.post('/logout', (req, res, next)=> {
    console.log("Logging out user...");
    try {
        req.logout();
        res.status(200).json({message: "logged out successfully"})
    } catch(err) {
        res.status(500).json({message: "Error attempting to logout", err});
    }
})

module.exports = userRoutes;