const debug = require('debug')('adotapet:api:util:generic');
const express = require('express');

function Generic() {
    this.getController = (api, modelName) => {
        const Model = api.models[modelName];
        return {
            _id: (req, res, next, _id) => {
                req._id = _id;
                next();
            },
            create: (req, res, next) => {
                Model.create(req.body)
                .then(doc => {
                    res.status(201).json(doc);
                })
                .catch(error => {
                    res.status(400).json(error);
                })
            },
            read: (req, res, next) => {
                Model.findOne({ _id: req._id })
                .exec()
                .then(doc => {
                    if (doc === null) {
                        res.status(404);
                    }
                    else {
                        res.status(200);
                    }
                    res.json(doc);
                })
                .catch(error => {
                    res.status(400).json(error);
                });
            },
            update: (req, res, next) => {
                Model.findOneAndUpdate({ _id: req._id }, req.body, { runValidators: true, context: 'query', new: true })
                .exec()
                .then(doc => {
                    res.status(200).json(doc);
                })
                .catch(error => {
                    res.status(409).json(error);
                });
            },
            patch: (req, res, next) => {
                Model.findOneAndUpdate({ _id: req._id }, req.body, { runValidators: true, context: 'query', new: true })
                .exec()
                .then(doc => {
                    res.status(200).json(doc);
                })
                .catch(error => {
                    res.status(409).json(error);
                });
            },
            delete: (req, res, next) => {
                Model.findOneAndRemove({ _id: req._id })
                .exec()
                .then(doc => {
                    res.status(200).json(doc);
                })
                .catch(error => {
                    res.status(400).json(error);
                });
            },
            list: (req, res, next) => {
                let queryable = Model.schema.queryable;
                queryable.forEach(path => {
                    if (req.query[path]) {
                        req.query[path] = {
                            $in: req.query[path]
                        }
                    }
                });

                let query = Model.find(req.query);
                Model.schema.populable.forEach(path => query.populate(path));
                query.exec()
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(error => {
                    res.status(400).json(error);
                });
            }
        }
    },
    this.getRouter = (api, modelName) => {
        let Controller = null;

        if (Object.keys(api.controllers).includes(modelName)) {
            Controller = api.controllers[modelName];
        }
        else {
            Controller = this.getController(api, modelName);
        }

        const router = express.Router();

        router.param('_id', Controller._id);

        router.route('/')
        .get(Controller.list)
        .post(Controller.create);

        router.route('/:_id')
        .get(Controller.read)
        .put(Controller.update)
        .delete(Controller.delete)
        .patch(Controller.patch);

        return router;
    }
}

module.exports = new Generic;