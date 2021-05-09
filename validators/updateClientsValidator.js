"use strict";
const Joi = require('joi');

exports.updateClients = Joi.object({
    name: Joi.string().required(),
    is_active: Joi.string().lowercase().allow(null, ''),
    height: Joi.string().allow(null, ''),
    weight: Joi.number().allow(null, ''),
    address: Joi.string().allow(null, ''),
    location: Joi.string().allow(null, ''),
    diet: Joi.string().allow(null, ''),
    plan: Joi.string().allow(null, '')
});