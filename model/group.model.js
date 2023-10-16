const joi = require('joi');

const groupSchema = joi.object({
    name: joi.string().min(3).max(15).required(),
    description: joi.string().min(10).max(60).required(),
    picture: joi.string().default(""),
    begin_date: joi.date().greater('now').required(),
    budget: joi.number().precision(2).required(),    
});

module.exports = {groupSchema};