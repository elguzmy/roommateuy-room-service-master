const roomRouter = require('express').Router();

const searchRouter = require('./search');
const roomController = require('../controllers/roomController');
const { isAuthenticated } = require('../lib/auth');
const { notFound } = require('../lib/errorManagement');

roomRouter.use('/search', searchRouter);

roomRouter.get('/', (req, res, next) => {
    const { user_id } = req.query;

    if (user_id) {
        return roomController.getRoomsByUserId(req, res, next);
    }

    next(notFound());
});
roomRouter.get('/:room_id', roomController.getRoomById);
roomRouter.post('/', isAuthenticated, roomController.createRoom);
roomRouter.put('/:room_id', isAuthenticated, roomController.updateRoomById);
roomRouter.delete('/:room_id', isAuthenticated, roomController.deleteRoomById);

roomRouter.post('/mediaUpload', roomController.uploadMedia);

module.exports = roomRouter;
