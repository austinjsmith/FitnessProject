"use strict";
const Joi = require("joi");

exports.postPostSchema = Joi.object({
    postText: Joi.string().max(300).required(),
    title: Joi.string().max(30).required()
});