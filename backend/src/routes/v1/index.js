const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const farmerRoute = require('./farmer.route');
const cropSurveyRoute = require('./cropSurvey.route');
const lossReportRoute = require('./lossReport.route');
const notificationRoute = require('./notification.route');
const panchanamaRoute = require('./panchanama.route');
const analyticsRoute = require('./analytics.route');
const uploadRoute = require('./upload.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/farmers',
    route: farmerRoute,
  },
  {
    path: '/crop-surveys',
    route: cropSurveyRoute,
  },
  {
    path: '/loss-reports',
    route: lossReportRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/panchanamas',
    route: panchanamaRoute,
  },
  {
    path: '/analytics',
    route: analyticsRoute,
  },
  {
    path: '/upload',
    route: uploadRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
