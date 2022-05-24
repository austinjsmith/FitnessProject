"use strict";
const Joi = require('joi');

exports.postTDEESchema= Joi.object({
    weight: Joi.number().integer().required(),
    age: Joi.number().integer().required()
});