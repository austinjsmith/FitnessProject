"use strict";
const Joi = require('joi');

exports.getClients = Joi.object({
    client_name: Joi.string().required()
});