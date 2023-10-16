const debugMongo = require("debug")("app:mongodb");
const debugFind = require("debug")("mongodb:find");
const debugInsert = require("debug")("mongodb:insert");
const debugUpdate = require("debug")("mongodb:update");
const debugDelete = require("debug")("mongodb:delete");
const debugData = require("debug")("request:data");
const {ObjectId} = require("mongodb");
const {groupDataSchema} = require("../model/validate.model");
const {groupSchema} = require("../model/group.model");
const {userCollection, jwtCollection, groupCollection} = require("../utils/db/collections.util");
const {projectUser} = require("../utils/project.util");

const jwt = require('jsonwebtoken');
const token = process.env.TOKEN_SECRET;

const controller = {};

controller.create = async (req, res) => {
    try {
        jwt.verify(req.token, token, async (error, authData) => {
            if (error) {
                return res.sendStatus(403).json({error: "Authorization failed",  details: {token: error.message}});
            }

            const findJWT = await jwtCollection().findOne({jwt: req.token});

            if(!findJWT || authData.user._id != findJWT.user) {
                return res.status(403).json({error: "Authorization failed", details: {test: "test"}});
            }

            const {
                name,
                description,
                picture,
                begin_date,
                budget
            } = req.body;
            
            let data;

            try {
                data = await groupSchema.validateAsync({ 
                    name: name, description: description, picture: picture, begin_date: begin_date, budget: budget 
                }, { abortEarly: false });
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

            const newGroup = await groupCollection().insertOne({
                name: data.name,
                group_owner: new ObjectId(authData.user._id),
                admin_users: [],
                participants: [],
                description: data.description,
                picture: data.picture,
                begin_date: data.begin_date,
                budget: data.budget,
                destinations_id: []
            });

            debugInsert(newGroup);

            if (!newGroup) {
                return res.status(409).json({error: "Ocurrio un error al registrar el grupo",  details: {}});
            }

            const groupAdded = await userCollection().updateOne(
                {_id: new ObjectId(authData.user._id)},
                {$push: {groups_id: newGroup.insertedId}}
            );

            debugUpdate(groupAdded);

            return res.status(201).json({status: "success"});
        });
    } catch (err) {
        debugMongo({err});
        return res.status(500).json({error: "Error interno de servidor",  details: {}})
    }
}

controller.delete = async (req, res) => {
    try {
        jwt.verify(req.token, token, async (error, authData) => {
            if (error) {
                return res.sendStatus(403).json({error: "Authorization failed",  details: {token: error.message}});
            }

            const findJWT = await jwtCollection().findOne({jwt: req.token});

            if(!findJWT || authData.user._id != findJWT.user) {
                return res.status(403).json({error: "Authorization failed", details: {test: "test"}});
            }

            const {
                identifier
            } = req.body;
            
            let data;

            try {
                data = await groupDataSchema.validateAsync({
                    _id: identifier
                }, { abortEarly: false });
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

            const findGroup = await groupCollection().findOne({_id: new ObjectId(data._id)});
            
            if (!findGroup) {
                return res.status(404).json({error: "No existe el grupo",  details: {}});
            }

            if (authData.user._id != findGroup.group_owner) {
                return res.status(403).json({error: "This action is forbidden", details: {}});
            }

            const deleteGroup = await groupCollection().deleteOne({
                _id: new ObjectId(data._id),
            });

            debugInsert(deleteGroup);

            if (!deleteGroup) {
                return res.status(409).json({error: "Ocurrio un error al eliminar el grupo",  details: {}});
            }

            const groupDeleted = await userCollection().updateMany(
                {groups_id: new ObjectId(data._id)},
                {$pull: {groups_id: new ObjectId(data._id)}}
            );

            debugUpdate(groupDeleted);

            return res.status(201).json({status: "success"});
        });
    } catch (err) {
        debugMongo({err});
        return res.status(500).json({error: "Error interno de servidor",  details: {}})
    }
}

module.exports = controller;