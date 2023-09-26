const mongoose = require('mongoose');
const uuid = require('uuid');
const mongoosePaginate = require('mongoose-paginate');

const { Schema } = mongoose;

const room_schema = new Schema({
    room_id:                {
                                type: String,
                                default: uuid.v4,
                            },

    user_id:                {
                                type: String,
                                required: true,
                            },

    headline:               String,

    description:            String,

    calendar:               {
                                date_in: Date,
                                date_out: Date,
                            },

    address:                {
                                address1: {
                                    type: String
                                },
                                address2: String,
                                city: {
                                    type: String
                                },
                                state: String,
                                country: {
                                    type: String
                                },
                                zip_code: {
                                    type: String
                                },
                            },

    location:               [Schema.Types.Mixed],

    rate:                   Number,

    rate_type:              {
                                type: String,
                                enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
                            },

    room_type:              {
                                type: String,
                                enum: ['SINGLE', 'DOUBLE', 'SHARED'],
                            },

    current_roommates:      {
                                type: Number,
                                default: 1,
                            },

    images:                 [String],

    details_age:            {
                                age_min: Number,
                                age_max: Number,
                            },

    details_cleanliness:    {
                                type: String,
                                enum: ['CLEAN', 'AVERAGE'],
                            },

    details_food_preferences: {
                                type: String,
                                enum: ['VEGAN', 'VEGETARIAN', 'ALMOST_ANYTHING'],
                              },

    details_my_pets:        String,

    details_bathroom_type:  {
                                type: String,
                                enum: ['SHARED', 'SUITE'],
                            },

    details_pet_allowed:     Boolean,

    details_smoking_preferences: Boolean,

    details_get_up_time:    String,

    details_go_to_bed_time: String,

    details_occupation:     {
                                type: String,
                                enum: ['STUDENT', 'PROFESSIONAL', 'BOTH'],
                            },

    details_overnight_guests: {
                                type: String,
                                enum: ['NEVER', 'RARELY', 'OCCASIONALLY'],
                             },

    details_party_habits:    {
                                type: String,
                                enum: ['OCCASIONALLY', 'RARELY', 'NEVER'],
                             },

    details_work_schedule:   {
                                work_in: String,
                                work_out: String,
                             },

    specs_furnished:        Boolean,

    specs_wifi:             Boolean,

    specs_balcony:          Boolean,

    specs_air:              Boolean,
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});

room_schema.plugin(mongoosePaginate);

room_schema.index({ location: '2dsphere' });

const Room = mongoose.model('Room', room_schema);

module.exports = Room;
