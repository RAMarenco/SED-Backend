const joi = require('joi');

const userSchema = joi.object({
    name: joi.string().min(3).max(15).required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|]).{8,30}$/)).required(),
    role: joi.string().required(),
});

const userEditSchema = joi.object({
    name: joi.string().min(3).max(15).required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|]).{8,30}$/)).required(),
});

const userAuthSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});

const loginAttemptSchema = joi.object({
    attempts: joi.number().integer().default(0),
    lastFailedAttempt: joi.date(),
    locked: joi.boolean().default(false),
});

module.exports = {userSchema, userEditSchema, userAuthSchema, loginAttemptSchema};