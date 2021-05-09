"use strict";
const Joi = require('joi');

exports.deleteClients = Joi.object({
    name: Joi.string().required()
});