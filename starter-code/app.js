require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const User = require('./models/user');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

mongoose
  .connect('mongodb://localhost/lab-roles', {useNewUrlParser: true})
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

const app_name = require('./package.json').name;
const debug = require('debug')(
  `${app_name}:${path.basename(__filename).split('.')[0]}`
);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(
  session({
    secret: 'lab-passport-roles',
    resave: true,
    saveUninitialized: true
  })
);

app.use(
  session({
    secret: 'basic-auth-secret',
    cookie: {maxAge: 60000},
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 // 1 day
    })
  })
);
// Express View engine setup

app.use(
  require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
  })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

app.use(flash());

passport.use(
  new LocalStrategy((username, password, next) => {
    User.findOne({username}, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(null, false, {message: 'Incorrect username'});
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return next(null, false, {message: 'Incorrect password'});
      }

      return next(null, user);
    });
  })
);

const index = require('./routes/index');
const authRouter = require('./routes/authRouter');
const bossRouter = require('./routes/bossRoutes');
const userRouter = require('./routes/userRouter');
const taRoutes = require('./routes/taRoutes');

app.use('/', index);
app.use('/', authRouter);
app.use('/adm', bossRouter);
app.use('/perfil', userRouter);
app.use('/course', taRoutes);

module.exports = app;
