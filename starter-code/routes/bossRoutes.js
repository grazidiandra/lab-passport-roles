const express = require('express');

const bossRouter = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

const bcryptSalt = 10;

function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.redirect('/login');
  };
}

bossRouter.get('/add', checkRoles('Boss'), (req, res, next) => {
  User.find()
    .then(arrUser => {
      res.render('boss/add', {arrUser});
    })
    .catch(err => console.log(`error: ${err}`));
});

bossRouter.post('/add', checkRoles('Boss'), (req, res, next) => {
  const {username, password, role} = req.body;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);
  const addUser = new User({username, password, role});
  addUser
    .save()
    .then(() => {
      res.redirect('/adm/add');
    })
    .catch(error => {
      console.log(error);
    });
});

bossRouter.post('/:id/delete', checkRoles('Boss'), (req, res, next) => {
  User.findByIdAndRemove(req.params.id)
    .then(() => {
      res.redirect('/adm/add');
    })
    .catch(error => {
      console.log('Error in delete movie: ', error);
    });
});

bossRouter.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = bossRouter;
