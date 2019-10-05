const express = require('express');
const authRoutes = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const User = require('../models/user');

authRoutes.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

authRoutes.post('/signup', (req, res, next) => {
  const {username, password, role} = req.body;

  if (username === '' || password === '') {
    res.render('auth/signup', {message: 'Indicate username and password'});
    return;
  }

  User.findOne({username})
    .then(user => {
      if (user !== null) {
        res.render('auth/signup', {message: 'The username already exists'});
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
        role
      });

      newUser.save(err => {
        if (err) {
          res.render('auth/signup', {message: 'Something went wrong'});
        } else {
          res.redirect('/');
        }
      });
    })
    .catch(error => {
      next(error);
    });
});

authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login', {message: req.flash('error')});
});

authRoutes.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/perfil',
    failureRedirect: '/login',
    failureFlash: true,
    passReqToCallback: true
  })
);

module.exports = authRoutes;
