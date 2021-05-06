"use strict";
const Joi = require('joi');

exports.postContentSchema = Joi.object({
    postid: Joi.string().guid(),
    postText: Joi.string().max(150).required()
});