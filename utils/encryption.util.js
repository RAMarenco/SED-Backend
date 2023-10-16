const crypto = require("crypto");
const debugEncryption = require("debug")("app:encryption");

const encryptPassword = (password, salt) => {
    if (!password) return "";

    try {
        const encryptedPassword = crypto.pbkdf2Sync(
            password,
            salt,
            1000, 64,
            'sha512'
        ).toString("hex");

        return encryptedPassword;
    } catch (error) {
        debugEncryption({error});
        return "";
    }
}

const makeSalt = () => {
    return crypto.randomBytes(16).toString("hex");
}

const comparePassword = (hash, salt, password) => {
    return hash === encryptPassword(password, salt);
}

module.exports = {encryptPassword, makeSalt, comparePassword};