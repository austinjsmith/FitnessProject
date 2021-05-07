"use strict";
const Joi = require('joi');

exports.deleteTrainers = Joi.object({
    trainer_name: Joi.string().required()
});