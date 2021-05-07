"use strict";
const Joi = require('joi');

exports.deleteClients = Joi.object({
    client_name: Joi.string().required()
});