var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var compression = require('compression');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');

var loginRouter = require('./routes/loginRoutes');
var dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const filtersRouter = require('./routes/filters');
const locationRouter = require('./routes/lieuRoutes');
const checkFirstConnect = require('./middleware/checkFirstConnect');
const lieuRouter = require('./routes/lieuRoutes');
const { performanceMonitor, performanceMetrics } = require('./middleware/performanceMonitor');

var expressLayouts = require('express-ejs-layouts');

var app = express();

// ===== OPTIMISATIONS DE PERFORMANCE =====

// 1. Compression GZIP pour toutes les réponses (réduit la taille de 70-90%)
app.use(compression({
  level: 6, // Niveau de compression (1-9, 6 est un bon compromis)
  threshold: 1024, // Compresser seulement si > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 2. Sécurité avec Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Désactiver CSP pour EJS (à configurer selon vos besoins)
}));

// 3. Rate limiting pour éviter les abus
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limite à 100 requêtes par IP
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Appliquer le rate limiting sur toutes les routes
app.use(limiter);

// Rate limiting plus strict pour les API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 30 requêtes par minute max
  message: 'Trop de requêtes API, veuillez ralentir.',
});

app.use('/api/', apiLimiter);
app.use('/stats/', apiLimiter);

// 4. Static files avec cache optimisé
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache des fichiers statiques pendant 1 jour
  etag: true,
  lastModified: true,
}));

// Configuration des sessions
app.use(session({
  secret: 'votre-secret-key', // à changer clé en production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettre à true si HTTPS
}));

// Middleware pour passer les messages aux vues
app.use((req, res, next) => {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  next();
});

// Middleware pour capter la premiere connection
app.use(checkFirstConnect);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layouts/base');

app.use(logger('dev'));

// Middleware de monitoring des performances
app.use(performanceMonitor);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes principales
app.use('/', dashboardRoutes);
app.use('/users', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/stats', statsRoutes);
app.use('/api/filters', filtersRouter);
app.use('/api', lieuRouter);
app.use('/auth', loginRouter);

// Route de monitoring des performances (protégée en production)
app.get('/api/metrics', (req, res, next) => {
  // En production, protéger cette route
  if (process.env.NODE_ENV === 'production' && req.query.token !== process.env.METRICS_TOKEN) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  performanceMetrics(req, res);
});


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
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
