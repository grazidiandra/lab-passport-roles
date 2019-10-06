const express = require('express');
const taRoutes = express.Router();
const User = require('../models/user');
const Course = require('../models/course');

function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.redirect('/login');
  };
}

taRoutes.get('/add', checkRoles('TA'), (req, res, next) => {
  Course.find()
    .then(arrCourse => {
      res.render('ta/course', {arrCourse, isTA: true});
    })
    .catch(err => console.log(`error: ${err}`));
});

taRoutes.post('/add', checkRoles('TA'), (req, res, next) => {
  const {title, description} = req.body;
  const addCourse = new Course({title, description});
  addCourse
    .save()
    .then(() => {
      res.redirect('/course/add');
    })
    .catch(error => {
      console.log(error);
    });
});

taRoutes.post('/:id/delete', checkRoles('TA'), (req, res, next) => {
  Course.findByIdAndRemove(req.params.id)
    .then(() => {
      res.redirect('/course/add');
    })
    .catch(error => {
      console.log('Error in delete: ', error);
    });
});

taRoutes.get('/:id/edit', (req, res, next) => {
  Course.findById(req.params.id)
    .then(course => {
      res.render('ta/edit', {course});
    })
    .catch(error => {
      console.log('Error in edit: ', error);
    });
});

taRoutes.post('/:id', (req, res, next) => {
  const {title, description} = req.body;
  Course.updateOne({_id: req.params.id}, {title, description})
    .then(() => {
      res.redirect('/course/add');
    })
    .catch(error => {
      console.log('Error in edit movies: ', error);
    });
});

module.exports = taRoutes;
