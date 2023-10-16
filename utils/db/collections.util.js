const {getDb} = require("./../../config/mongodb");

const userCollection = () => {
    try {
        return getDb().collection("user");
    } catch (err) {
        debugMongo(err);
    }
};

const jwtCollection = () => {
    try {
        return getDb().collection("jwt");
    } catch (err) {
        debugMongo(err);
    }
};

const loginAttemptCollection = () => {
    try {
        return getDb().collection("loginattempt");
    } catch (err) {
        debugMongo(err);
    }
}

const groupCollection = () => {
    try {
        return getDb().collection("group");
    } catch (err) {
        debugMongo(err);
    }
}

module.exports = {userCollection, jwtCollection, loginAttemptCollection, groupCollection};