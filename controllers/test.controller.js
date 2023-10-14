const debugMongo = require("debug")("app:mongodb");
const debugFind = require("debug")("mongodb:find");
const debugInsert = require("debug")("mongodb:insert");
const debugData = require("debug")("request:data");
const {getDb} = require("./../config/mongodb");
const testschema = require("./../model/test.model");
const crypto = require("crypto");

const jwt = require('jsonwebtoken');
const token = process.env.TOKEN_SECRET;

const controller = {}

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
        debugMongo({error});
        return "";
    }
}

const makeSalt = () => {
    return crypto.randomBytes(16).toString("hex");
}

//* Create a new user type in the userType collection
controller.create = async (req, res) => {
    try {
        jwt.verify(req.token, token, async (error, authData) => {
            if (error) {
                return res.sendStatus(403);
            }

            /*if (authData.userType !== auth) {
                return res.sendStatus(403);
            }*/

            //debug(authData);

            const {
                name,
                email,
                password
            } = req.body;
            
            let data;

            try {
                data = await testschema.validateAsync({ name: name, email: email, hash: password }, { abortEarly: false });
            }
            catch (err) {
                debugData(err.details);
                const validationErrors = err.details.map((detail) => ({
                    message: detail.message,
                    path: detail.path.join('.'),
                  }));
                return res.status(400).json({ error: 'Validation Error', details: validationErrors });
            }
            debugData(data);
            
            const testCollection = await getDb().collection("test");

            const verifyTest = await testCollection.find({email: data.email}, ).project({ name: 0, _id: 0, password: 0}).toArray();
            debugFind(verifyTest);
            if (verifyTest.length !== 0) {
                return res.status(409).json({error: "El dato ya existe"});
            }

            const salt = makeSalt();
            const hashedPassword = encryptPassword(password, salt);

            const newT = await testCollection.insertOne({
                name: data.name,
                email: data.email,
                hash: hashedPassword,
                salt: salt,
                picture: "",
                groups_id: [],
            });

            debugInsert(newT);

            if (!newT) {
                return res.status(409).json({error: "Ocurrio un error al registrar el test"});
            }

            return res.status(201).json({status: "success"});
        });
    } catch (err) {
        debugMongo({err});
        return res.status(500).json({error: "Error interno de servidor"})
    }
}

module.exports = controller;