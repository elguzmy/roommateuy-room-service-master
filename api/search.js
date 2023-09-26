const searchRouter = require('express').Router();

const roomController = require('../controllers/roomController');

searchRouter.get('/location', roomController.searchRoomsByLocation);

module.exports = searchRouter;