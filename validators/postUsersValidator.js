"use strict";
const Joi = require('joi');

exports.postUsersSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(20).lowercase().required()
});