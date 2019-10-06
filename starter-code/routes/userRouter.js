const express = require('express');
const passport = require('passport');
const userRouter = express.Router();
const ensureLogin = require('connect-ensure-login');
const User = require('../models/user');

userRouter.get('/', ensureLogin.ensureLoggedIn(), (req, res) => {
  if (req.user.role === 'TA') {
    res.render('perfil/home', {user: req.user, isTA: true});
  } else if (req.user.role === 'Boss') {
    res.render('perfil/home', {user: req.user, isBoss: true});
  }
});

userRouter.get('/:id/edit', (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      res.render('perfil/home', {user});
    })
    .catch(error => {
      console.log('Error in edit: ', error);
    });
});

userRouter.post('/:id', (req, res, next) => {
  const {username, favoriteFood, favoriteCharacter, favoriteColor} = req.body;
  User.updateOne(
    {_id: req.params.id},
    {username, favoriteFood, favoriteCharacter, favoriteColor}
  )
    .then(() => {
      res.redirect('/perfil');
    })
    .catch(error => {
      console.log('Error in edit: ', error);
    });
});

userRouter.get('/users', (req, res, next) => {
  User.find()
    .then(theUsers => {
      res.render('perfil/users', {theUsers});
    })
    .catch(error => {
      console.log('Error: ', error);
    });
});

module.exports = userRouter;
