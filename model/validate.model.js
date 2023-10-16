const joi = require('joi');

const userDataSchema = joi.object({
    _id: joi.string().min(24).max(24),
    name: joi.string().min(3).max(15),
    email: joi.string().email(),
    role: joi.string()
});

const groupDataSchema = joi.object({
    _id: joi.string().min(24).max(24),
})

module.exports = {userDataSchema, groupDataSchema};