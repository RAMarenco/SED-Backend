const {loginAttemptCollection} = require("./db/collections.util");

const lockAccount = async (userId) => {
    const loginAttempt = await loginAttemptCollection().findOne({ user: userId });
    if (loginAttempt) {
        loginAttempt.attempts++;
        if (loginAttempt.attempts >= 5) {
            loginAttempt.locked = true;
            loginAttempt.lastFailedAttempt = new Date();
            return await loginAttemptCollection().updateOne({user: userId}, {$set: loginAttempt});
        }        
        return await loginAttemptCollection().updateOne({user: userId}, {$set: loginAttempt});
    }
  }
  
  // Function to unlock an account after 5 minutes
const unlockAccount = async (userId) => {
    const loginAttempt = await loginAttemptCollection().findOne({ user: userId });
    if (loginAttempt) {
        if (loginAttempt.locked) {
            const currentTime = new Date();
            const lockTime = loginAttempt.lastFailedAttempt;
            const elapsedMinutes = (currentTime - lockTime) / (1000 * 60);
            if (elapsedMinutes >= 5) {
                loginAttempt.locked = false;
                loginAttempt.attempts = 0;
                await loginAttemptCollection().updateOne({user: userId}, {$set: loginAttempt});
                return loginAttempt.locked;
            }             
        }
        return loginAttempt.locked;
    }
}

const resetLoginAttempt = async (userId) => {
    const loginAttempt = await loginAttemptCollection().findOne({ user: userId });
    if (loginAttempt) {
        loginAttempt.locked = false;
        loginAttempt.attempts = 0;
        await loginAttemptCollection().updateOne({user: userId}, {$set: loginAttempt});
        return loginAttempt.locked;
    }
}

module.exports = {lockAccount, unlockAccount, resetLoginAttempt};