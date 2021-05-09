"use strict";
const Joi = require('joi');

exports.updateTrainers = Joi.object({
    name: Joi.string().required(),
    license: Joi.number().allow(null, ''),
    address: Joi.string().allow(null, ''),
    location: Joi.string().allow(null, '')
});