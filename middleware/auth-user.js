'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async (req, res, next) => {
    
    let message; // store the message to display

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);

    if (credentials) {
        const user = await User.findOne({ where: {username: credentials.name} });
        if (user) {
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.confirmedPassword);
            if (authenticated) { // If the passwords match
                console.log(`Authentication successful for username: ${user.username}`);

                // Store the user on the Request object.
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${user.username}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
  };