"use strict";
const Joi = require('joi');

exports.postCommentSchema = Joi.object({
    commentText: Joi.string().max(150).required()
});