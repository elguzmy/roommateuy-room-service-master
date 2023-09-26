const apiRoutes = require('express').Router();

const roomRouter = require('./room');
const healthRouter = require('./health');

const config = require('../lib/config');

apiRoutes.use(`/${config.roomAPI.url}`, roomRouter);
apiRoutes.use('/roomHealth', healthRouter);

module.exports = apiRoutes;
