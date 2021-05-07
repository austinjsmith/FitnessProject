"use strict";
const Joi = require('joi');

exports.addClients = Joi.object({
    name: Joi.string().required(),
    is_active: Joi.string().lowercase().required(),
    height: Joi.string().required(),
    weight: Joi.number().required(),
    address: Joi.string(),
    location: Joi.string().required(),
    diet: Joi.string(),
    plan: Joi.string()
});