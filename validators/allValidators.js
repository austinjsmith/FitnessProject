"use strict";

const VALIDATION_OPTIONS = {
    abortEarly: false,
    stripUnknown: true,
    errors: {
        escapeHTML: true,
    }
};

//all validator files here
const {postUsersSchema} = require("./postUsersValidator");
const {postLoginSchema} = require("./postLoginValidator");
const {postMealSchema} = require("./postMealValidator");
const {postTDEESchema} = require("./postTDEEValidator");
const {postContentSchema} = require("./postContentValidator");
const {postPostSchema} = require("./newPostValidator");
const {postCommentSchema} = require("./postCommentValidator");

const schemas = {
    postUsersSchema,
    postLoginSchema,
    postMealSchema,
    postTDEESchema,
    postContentSchema,
    postPostSchema,
    postCommentSchema
}

exports.schemas = schemas;
exports.VALIDATION_OPTIONS = VALIDATION_OPTIONS; 