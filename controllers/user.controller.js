const debugMongo = require("debug")("app:mongodb");
const debugFind = require("debug")("mongodb:find");
const debugInsert = require("debug")("mongodb:insert");
const debugDelete = require("debug")("mongodb:delete");
const debugData = require("debug")("request:data");
const {ObjectId} = require("mongodb");
const {userSchema} = require("../model/user.model");
const {userDataSchema} = require("../model/validate.model");
const {userCollection, jwtCollection, loginAttemptCollection} = require("../utils/db/collections.util");
const {encryptPassword, makeSalt} = require("../utils/encryption.util");
const {projectUser} = require("../utils/project.util");

const jwt = require('jsonwebtoken');
const token = process.env.TOKEN_SECRET;

const controller = {};

controller.create = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;
        
        let data;

        try {
            data = await userSchema.validateAsync({ name: name, email: email, password: password, role: role }, { abortEarly: false });
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

        const verifyUser = await userCollection().find({email: data.email}).project(projectUser).toArray();
        debugFind(verifyUser);
        if (verifyUser.length !== 0) {
            return res.status(409).json({error: "User already exists",  details: {}});
        }

        const salt = makeSalt();
        const hashedPassword = encryptPassword(data.password, salt);

        const newUser = await userCollection().insertOne({
            name: data.name,
            email: data.email,
            hash: hashedPassword,
            salt: salt,
            role: data.role,
            picture: "",
            groups_id: [],
        });

        await loginAttemptCollection().insertOne({
            user: newUser.insertedId,
            attempts: 0,
            lastFailedAttempt: new Date(0),
            locked: false
        });

        debugInsert(newUser);

        if (!newUser) {
            return res.status(409).json({error: "An error ocurred when trying to create the user",  details: {}});
        }

        return res.status(201).json({status: "success"});
    } catch (err) {
        debugMongo({err});
        return res.status(500).json({error: "Internal server error",  details: {}})
    }
}

controller.findAll = async (req, res) => {
    try {
        jwt.verify(req.token, token, async (error, authData) => {
            if (error) {
                return res.sendStatus(403).json({error: "Authorization failed",  details: {token: error.message}});
            }

            const findJWT = await jwtCollection().findOne({jwt: req.token});

            if(!findJWT || authData.user._id != findJWT.user) {
                return res.status(403).json({error: "Authorization failed", details: {test: "test"}});
            }

            const adminUser = await userCollection().findOne({_id: findJWT.user}, {projection: {_id: projectUser._id, hash: projectUser.hash, salt: projectUser.salt}});            

            if(!adminUser || authData.user.role != adminUser.role || adminUser.role != "admin") {
                return res.status(403).json({error: "Authorization failed", details: {}});
            }

            const users = await userCollection().find({}).project({ _id: projectUser._id, hash: projectUser.hash, salt: projectUser.salt, role: projectUser.role}).toArray();
            debugFind(users);
            
            if(!users) {
                return res.status(404).json({error: "No available users",  details: {}});
            }

            return res.status(202).json(users);
        });
    } catch (err) {
        debugMongo({err});
        return res.status(500).json({error: "Internal server error",  details: {}})
    }
}

controller.delete = async (req, res) => {
    try {
        jwt.verify(req.token, token, async (error, authData) => {
            if (error) {
                return res.sendStatus(403).json({error: "Authorization failed",  details: {}});
            }

            const findJWT = await jwtCollection().findOne({jwt: req.token});

            if(!findJWT || authData.user._id != findJWT.user) {
                return res.status(403).json({error: "Authorization failed", details: {}});
            }

            const adminUser = await userCollection().findOne({_id: findJWT.user}, {projection: {_id: projectUser._id, hash: projectUser.hash, salt: projectUser.salt}});            

            if(!adminUser || authData.user.role != adminUser.role || adminUser.role != "admin") {
                return res.status(403).json({error: "Authorization failed", details: {}});
            }

            const {
                idu,
            } = req.body;

            let data;

            if (!idu) {
                return res.status(400).json({error: "Bad request", details: {}});
            }

            try {
                data = await userDataSchema.validateAsync({ _id: idu }, { abortEarly: false });
            }
            catch (err) {
                debugData(err.details);
                const validationErrors = err.details.map((detail) => ({
                    message: detail.message,
                    path: detail.path.join('.'),
                  }));
                return res.status(400).json({ error: 'Validation Error', details: validationErrors });
            }

            const findUser = await userCollection().findOne({_id: new ObjectId(data._id)});
            
            if (!findUser) {
                return res.status(404).json({error: "User doesn't exists",  details: {}});
            }

            if (adminUser.role === findUser.role || adminUser._id === findUser._id) {
                return res.status(403).json({error: "This action is forbidden", details: {}});
            }

            const user = await userCollection().deleteOne({_id: new ObjectId(data._id)});
            debugDelete(user);

            await loginAttemptCollection().deleteOne({user: new ObjectId(data._id)});

            return res.status(201).json({status: "Success"});
        });
    } catch (err) {
        debugMongo({err});
        return res.status(500).json({error: "Internal server error",  details: {}})
    }
}

module.exports = controller;