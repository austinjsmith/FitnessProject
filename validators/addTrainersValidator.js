"use strict";
const Joi = require('joi');

exports.addTrainers = Joi.object({
    name: Joi.string().required(),
    license: Joi.number().required(),
    address: Joi.string(),
    location: Joi.string().required(),
});