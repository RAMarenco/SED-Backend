const joi = require('joi');

const testschema = joi.object({
    name: joi.string().min(3).max(15).required(),
    email: joi.string().email(),
    hash: joi.string().pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|]).{8,30}$/)),
});

module.exports = testschema;