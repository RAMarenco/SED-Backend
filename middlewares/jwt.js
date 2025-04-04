const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];    
    if (typeof bearerHeader !== 'undefined' && bearerHeader !== '') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = verifyToken;