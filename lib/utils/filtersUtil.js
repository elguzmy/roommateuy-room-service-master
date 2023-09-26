const _ = require('lodash');

const logger = require('./logger');

const filtersMap = {
    price_min: 'rate_min',
    price_max: 'rate_max',
    date_in: 'calendar.date_in',
    date_out: 'calendar.date_out',
    room_type: 'room_type',
    details_bathroom_type: 'details_bathroom_type',
    specs_furnished: 'specs_furnished',
    specs_wifi: 'specs_wifi',
    details_smoking_preferences: 'details_smoking_preferences',
    specs_balcony: 'specs_balcony',
    specs_air: 'specs_air',
};

const filterTypeMap = {
    price_min: Number,
    price_max: Number,
    date_in: String,
    date_out: String,
    room_type: String,
    details_bathroom_type: String,
    specs_furnished: Boolean,
    specs_wifi: Boolean,
    details_smoking_preferences: Boolean,
    specs_balcony: Boolean,
    specs_air: Boolean,
};

const parseSerializedFilters = (urlParams) => {
    const normalizedFilters = {};

    for (let param in urlParams) {
        if (urlParams.hasOwnProperty(param)) {
            const normalizedFilter = filtersMap[param];

            if (normalizedFilter) {
                try {
                    let value;

                    if (filterTypeMap[param] === Number) {
                        value = parseFloat(urlParams[param]);

                        if (isNaN(value)) {
                            continue;
                        }
                    } else if (filterTypeMap[param] === String) {
                        value = String(urlParams[param]);
                    } else if (filterTypeMap[param] === Boolean) {
                        value = urlParams[param].toLowerCase() === 'true';
                    }

                    _.set(normalizedFilters, normalizedFilter, value);
                } catch (e) {
                    logger.log('debug', `Invalid type ${param} --> ${urlParams[param]}`);
                }
            }

            for (let filter in normalizedFilters) {
                if (normalizedFilters.hasOwnProperty(filter)) {
                    if (!normalizedFilters[filter]) {
                        delete normalizedFilters[filter];
                    }
                }
            }
        }
    }

    return normalizedFilters;
};

module.exports = {
    parseSerializedFilters,
};