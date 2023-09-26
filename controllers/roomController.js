const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const multiparty = require('multiparty');
const bluebird = require('bluebird');

const RoomService = require('../services/RoomService');
const filtersUtil = require('../lib/utils/filtersUtil');
const { notFound, error } = require('../lib/errorManagement');
const config = require('../lib/config');

AWS.config.update({
    accessKeyId: config.aws.awsAccessKey,
    secretAccessKey: config.aws.awsAccessSecret,
    region: config.aws.awsRegion,
});

AWS.config.setPromisesDependency(bluebird);

const s3 = new AWS.S3();
const roomService = new RoomService();

const createRoom = async (req, res, next) => {
    const roomData = req.body;

    try {
        await roomService.createRoom({ roomData });
        res.sendStatus(201);
    } catch (e) {
        next(e);
    }
};

const getRoomsByUserId = async (req, res, next) => {
    const { user_id } = req.query;

    try {
        const rooms = await roomService.getRoomsByUserId({ user_id });

        res.status(200).json(rooms);
    } catch (e) {
        next(e);
    }
};

const getRoomById = async (req, res, next) => {
    const { room_id } = req.params;

    try {
        const room = await roomService.getRoomById({ room_id });

        res.status(200).json(room);
    } catch (e) {
        next(e);
    }
};

//TODO: Check logged in user id
const updateRoomById = async (req, res, next) => {
    const roomData = req.body;
    const { room_id } = req.params;

    try {
        await roomService.updateRoomById({ roomData, room_id });
        res.sendStatus(204);
    } catch (e) {
        next(e);
    }
};

//TODO: Check logged in user id
const deleteRoomById = async (req, res, next) => {
    const { room_id } = req.params;

    try {
        await roomService.deleteRoomById({ room_id });
        res.sendStatus(204);
    } catch (e) {
        next(e);
    }
};

const searchRoomsByLocation = async (req, res, next) => {
    const { lat, lng, page } = req.query;
    const filters = filtersUtil.parseSerializedFilters(req.query);

    try {
        const rooms = await roomService.searchRoomsByLocation({ lat, lng, page, filters });

        res.status(200).json(rooms);
    } catch (e) {
        next(e);
    }
};

const uploadMedia = async (req, res, next) => {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return next(error({ message: err.message, errorCode: 'ERR_FILE_UPLOAD', statusCode: 400 }));
        }

        try {
            const file = files.file[0];

            if (!file) {
                return next(error({ message: 'file is empty', errorCode: 'ERR_FILE_UPLOAD_EMPTY', statusCode: 400 }));
            }

            const path = file.path;
            const size = file.size;

            if (size > 5e+6) {
                return next(error({ message: 'File max size is 5mb', errorCode: 'ERR_FILE_UPLOAD_SIZE', statusCode: 400 }));
            }

            const buffer = fs.readFileSync(path);
            const type = fileType(buffer);
            const timestamp = Date.now().toString();
            const fileName = `room/static/images/room-${timestamp}`;

            if (type.mime !== 'image/jpeg' && type.mime !== 'image/jpg' && type.mime !== 'image/png') {
                return next(error({ message: 'Invalid file type', errorCode: 'ERR_FILE_UPLOAD_INVALID_TYPE', statusCode: 400 }));
            }

            // const metadata = {
            //     'userId': req.params.user_id,
            // };
            const data = await _uploadFile(buffer, fileName, type);

            // await roomService.addRoomImage({ image_url: data.Location });

            return res.status(200).json({ imageUrl: data.Location });
        } catch (e) {
            return next(error({ message: e.message, errorCode: 'ERR_FILE_UPLOAD', statusCode: 400 }));
        }
    });
};

const _uploadFile = (buffer, name, type, metadata = {}) => {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: config.aws.s3.bucket,
        ContentType: type.mime,
        Key: `${name}.${type.ext}`,
    };

    return s3.upload(params).promise();
};

module.exports = {
    createRoom,
    getRoomsByUserId,
    getRoomById,
    updateRoomById,
    deleteRoomById,
    searchRoomsByLocation,
    uploadMedia,
};