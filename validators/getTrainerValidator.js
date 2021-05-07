"use strict";
const Joi = require('joi');

exports.getTrainers = Joi.object({
    trainer_name: Joi.string().required()
});