"use strict";
const Joi = require('joi');

exports.postMealSchema= Joi.object({
    mealname: Joi.string().required(),
    maincalorie: Joi.number().integer().min(0).required(),
    fats: Joi.number().integer().min(0).optional().allow(""),
    carbs: Joi.number().integer().min(0).optional().allow(""),
    proteins: Joi.number().integer().min(0).optional().allow(""),
});