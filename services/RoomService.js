const Room = require('../models/room');
const { missingParam, dbError, notFound, errorType } = require('../lib/errorManagement');
const logger = require('../lib/utils/logger');

class RoomService {
    async createRoom ({ roomData }) {
        try {
            return await Room.create(roomData);
        } catch (err) {
            throw dbError(err);
        }
    }

    async getRoomsByUserId ({ user_id }) {
        if (!user_id) {
            throw missingParam({ param: 'user_id' });
        }

        try {
            const rooms = await Room.find({ user_id }).select('-__v -_id');

            return rooms;
        } catch (err) {
            if (!err.type || err.type !== errorType.APPLICATION) {
                throw dbError(err);
            } else {
                throw err;
            }
        }
    }

    async getRoomById ({ room_id }) {
        if (!room_id) {
            throw missingParam({ param: 'room_id' });
        }

        try {
            const room = await Room.findOne({ room_id }).select('-__v -_id');

            if (!room) {
                throw notFound();
            }

            return room;
        } catch (err) {
            if (!err.type || err.type !== errorType.APPLICATION) {
                throw dbError(err);
            } else {
                throw err;
            }
        }
    }

    async updateRoomById ({ roomData, room_id }) {
        if (!room_id) {
            throw missingParam({ param: 'room_id' });
        }

        if (roomData.room_id) {
            delete roomData.room_id;
        }

        if (roomData.user_id) {
            delete roomData.user_id;
        }

        try {
            const room = await Room.findOneAndUpdate({ room_id }, roomData);

            if (!room) {
                throw notFound();
            }

            return room;
        } catch (err) {
            if (!err.type || err.type === errorType.DB) {
                throw dbError(err);
            } else {
                throw err;
            }
        }
    }

    async deleteRoomById ({ room_id }) {
        if (!room_id) {
            throw missingParam({ param: 'user_id' });
        }

        try {
            const room = await Room.findOne({ room_id });

            if (!room) {
                throw notFound();
            }

            await room.delete();
        } catch (err) {
            if (!err.type || err.type === errorType.DB) {
                throw dbError(err);
            } else {
                throw err;
            }
        }
    }

    async searchRoomsByLocation ({ lat, lng, page = 1, filters = {} }) {
        if (!lat) {
            throw missingParam({ param: 'user_id' });
        }

        if (!lng) {
            throw missingParam({ param: 'lng' });
        }

        try {
            let queryConditions;

            queryConditions = {
                location:
                    { '$near':
                            {
                                '$maxDistance': 1500,
                                '$geometry': {
                                    type: 'Point',
                                    coordinates: [lat, lng],
                                },
                            },
                    },
            };

            if (filters && Object.keys(filters).length) {
                queryConditions['$and'] = [];

                for (let filter in filters) {
                    if (filters.hasOwnProperty(filter)) {
                        if (filter === 'rate_min') {
                            queryConditions['$and'].push({ rate: { $gte: filters['rate_min'] } });
                        } else if (filter === 'rate_max') {
                            queryConditions['$and'].push({ rate: { $lte: filters['rate_max'] } });
                        } else if (filter === 'calendar') {
                            const calendar = filters['calendar'];

                            // NOTE: Do we need a date in filter?
                            // if (calendar.date_in) {
                            //     const date_in = new Date(calendar.date_in);
                            //
                            //     queryConditions['$and'].push({ 'calendar.date_in': { $gte: date_in } });
                            // }

                            if (calendar.date_out) {
                                const date_out = new Date(calendar.date_out);

                                queryConditions['$and'].push({ 'calendar.date_out': {$gte: date_out} });
                            }
                        } else {
                            queryConditions['$and'].push({ [filter]: {$eq: filters[filter] }});
                        }
                    }
                }

                if (!queryConditions['$and'].length) {
                    delete queryConditions['$and'];
                }
            }

            return await Room.paginate(
                queryConditions,
                {
                    select: '-__v -_id',
                    limit: 10,
                    page: parseInt(page, 10),
                },
            );
        } catch (err) {
            if (!err.type || err.type === errorType.DB) {
                throw dbError(err);
            } else {
                throw err;
            }
        }
    }

    async addRoomImage ({ room_id, image_url }) {
        if (!room_id) {
            throw missingParam({ param: 'room_id' });
        }

        if (!image_url) {
            throw missingParam({ param: 'image_url' });
        }

        try {
            return Room.findOneAndUpdate({ room_id }, { $push: { images: image_url } });
        } catch (err) {
            if (!err.type || err.type === errorType.DB) {
                throw dbError(err);
            } else {
                throw err;
            }
        }
    }
}

module.exports = RoomService;