var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');


var loginRouter = require('./routes/loginRoutes');
var dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const indicateursClesRoutes = require('./routes/indicateursClesRoutes');
const concretisationRoutes = require('./routes/concretisationRoutes');
const filtersRouter = require('./routes/filters');
const locationRouter = require('./routes/location');


var expressLayouts = require('express-ejs-layouts');

var app = express();

// Configuration des sessions
app.use(session({
  secret: 'votre-secret-key', // Changez cette clé en production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettez à true si vous utilisez HTTPS
}));

// Middleware pour passer les messages aux vues
app.use((req, res, next) => {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layouts/base');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//app.use('/api/users', userRoutes);
app.use('/', dashboardRoutes);
app.use('/users', userRoutes);
app.use('/api', locationRoutes);
app.use('/stats', statsRoutes);
app.use('/indicateursCles', indicateursClesRoutes);
app.use('/concretisation', concretisationRoutes);
app.use('/api/filters', filtersRouter);
app.use('/api/location', locationRouter);



app.use((req, res, next) => {
  res.locals.message = null;
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
