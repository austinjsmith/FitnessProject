"use strict";
const Joi = require('joi');

exports.deleteTrainers = Joi.object({
    name: Joi.string().required()
});