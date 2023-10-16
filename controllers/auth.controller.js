const debugMongo = require("debug")("app:mongodb");
const debugFind = require("debug")("mongodb:find");
const debugInsert = require("debug")("mongodb:insert");
const debugData = require("debug")("request:data");
const {userCollection, jwtCollection} = require("../utils/db/collections.util");
const {userAuthSchema} = require("../model/user.model");
const {lockAccount, unlockAccount, resetLoginAttempt} = require("./../utils/accountLock.util");
const {comparePassword} = require("../utils/encryption.util");

const jwt = require("jsonwebtoken");
const token = process.env.TOKEN_SECRET;
//const auth = process.env.AUTH;

const controller = {}

controller.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
    
        let data;

        try {
            data = await userAuthSchema.validateAsync({ email: identifier, password: password }, { abortEarly: false });
        }
        catch (err) {
            debugData(err.details);
            const validationErrors = err.details.map((detail) => ({
                message: detail.message,
                path: detail.path.join('.'),
              }));
            return res.status(400).json({ error: 'Validation Error', details: validationErrors });
        }

        const user = await userCollection().findOne(
            { email: data.email },
        );
        
        if (!user) {
            return res.status(401).json({ error: "Credenciales incorrectas", details: {} });
        }
        
        const unlock = await unlockAccount(user._id);
        debugData(unlock);

        if(unlock) {
            return res.status(401).json({ error: "Cuenta bloqueada intenta en 5 minutos", details: {status: unlock} });
        }

        if (!comparePassword(user.hash, user.salt, data.password)) {
            lockAccount(user._id);
            return res.status(401).json({ error: "Credenciales incorrectas", details: {} });
        }

        delete user.hash;
        delete user.salt;

        resetLoginAttempt(user._id);

        debugFind(user);

        const { _id, email, role } = user;
    
        const JWT = jwt.sign(
            {
                user: { _id, email, role },
            }, token, {expiresIn: "1d"},
        );

        const newJWT = await jwtCollection().insertOne({
            jwt: JWT,
            user: _id
        });

        debugInsert(newJWT);

        if (!newJWT) {
            return res.status(409).json({error: "Ocurrio un error al registrar el jwt", details: {}});
        }

        return res.status(200).json({
            user: { _id },
            JWT
        });
    } catch (error) {
        debugMongo({ error });
        return res.status(500).json({ error: "Error Inesperado", details: {}});
    }
};

module.exports = controller;