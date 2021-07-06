const express = require('express');
const { isValidObjectId } = require('mongoose');
const Container = require('../models/Container');
const Item = require('../models/Item');
const ObjectId = require("mongodb").ObjectID;



const containerRoutes = express.Router();

/*
* Container CRUD routes
*/

// POST: CREATE a new container
containerRoutes.post('', (req, res)=> {
    // create items
    if(req.isAuthenticated()){
        try {
            if(req.body.items){
                createItems(req.body.items).then(newItems => {
                    createContainer(req.body, newItems);
                })
            } else {
                createContainer(req.body, []);
            }
        } catch(err) {
            res.status(500).json({message: "error creating container"})
        }
    
        async function createItems(items){
            let dbItems = [];
            for(let i of items){
                console.log(i);
                let newItem = new Item({
                    name: i.name,
                    description: i.description,
                    photos: i.photos
                });
                await newItem.save().then(result => {
                    console.log("new item:", result)
                    dbItems.push(result._id);
                })
            }
            return dbItems;
        }
    
        const createContainer = function(body, items){
            let {access, name, description, canEdit, canView} = body;
            const newcContainer = new Container({
                access: access,
                canEdit: canEdit,
                canView: canView,
                creator: req.user._id,
                description: description,
                name: name,
                items: items
            });
            newcContainer.save().then(result => {
                console.log("Created a new container:", result)
                res.status(201).json(result)
            }).catch(err => {
                throw err;
            })
        }
    } else {
        res.status(401).json({message: "User not logged not"})
    }
})

// GET: READ single container
containerRoutes.get('/:id', (req, res) => {
    if(req.isAuthenticated()){
        let containerId = req.params.id;
        console.log("Getting container", req.params.id);
        Container.findById(containerId)
        .then(doc => {
            console.log("Got container", doc);
            if(doc){
                if(doc.access === 'public' || doc.creator.equals(req.user._id) || doc.canView.includes(req.user.id)){
                    doc.populate('items').execPopulate().then(doc => {
                        res.status(200).json(doc);
                    })
                } else {
                    res.status(403).json({message: "user is not authorized to view this"});
                }
            } else {
                res.status(404).json({message: "Container not found!"})
            }
        }).catch(err => {
            res.status(500).json({message: "Error retrieving container:", err})
        })
    } else {
        res.status(401).json({message: "not logged in"})
    }
})

// GET: READ all of a user's containers
// TODO:
//  - create a 'private' vs 'public' flag on user acct level -- if the user has a private acct, no one can see their containers
//      - if no public containers on a public acct, display "this user does not have any public containers" msg
//  - on 'docs' below, filter for public vs private container access
//      - for private access containers, filter canView list for req.user._id
//  - another thought: 'access' flag on containers should be changed to publicAccess, type should be boolean
containerRoutes.get('/all/:userId', (req, res) => {
    let userId = req.params.userId;
    Container.find({creator: userId})
    .then(docs => {
        if(docs){
            res.status(200).json(docs);
        } else {
            res.status(404).json({message: "Could not find user's containers"});
        }
    }).catch(err => {
        res.status(500).json({message: "Error retrieiving user's containers:", err});
    })
})

// PUT: UPDATE a container
// On the frontend, we should prevent anyone from editing the container who isn't part of the container's canEdit list
// On the backend, we should still do an isAuthenticated check, and ensure that the user is part of the CURRENT canEdit list
containerRoutes.put('/:id', (req, res) => {
    if(req.isAuthenticated()){
        let containerId = req.params.id;
        Container.findById(containerId)
        .exec()
        .then(container => {
            if(container.creator.equals(req.user._id) || container.canEdit.includes(req.user._id)){
                let {name, description, canEdit, canView, access, photos, tags} = req.body;

                Container.findOneAndUpdate({_id: containerId}, {
                    name: pruneUpdate(container.name, name),
                    description: pruneUpdate(container.description, description),
                    canEdit: pruneUpdate(container.canEdit, canEdit),
                    canView: pruneUpdate(container.canView, canView),
                    access: pruneUpdate(container.access, access),
                    photos: pruneUpdate(container.photos, photos),
                    tags: pruneUpdate(container.tags, tags)
                }, {new: true}).exec().then(doc => {
                    console.log("Updated container:", doc);
                    res.status(200).json({message: "successfully updated container"});
                }).catch(err => {
                    res.status(500).json({message: "Error updating container:", err});
                })
            } else {
                res.status(403).json({message: "you don't have permission to edit this"});
            }
        }).catch(err => {
            res.status(500).json({message: "Error updating container:", err});
        })
    } else {
        res.status(401).json({message: "not logged in"});
    }

    // remove null values, dupes
    function pruneUpdate(oldValue, newValue){
        if(oldValue === null || oldValue === newValue) return oldValue;
        if(ObjectId.isValid(newValue)){
            if(oldValue.equals(newValue)) {
                return oldValue;
            } else {
                return newValue;
            }
        }
        return newValue;
    }
})

// DELETE: DELETE a container
containerRoutes.delete('/:id', (req, res) => {
    if(req.isAuthenticated()){
        let containerId = req.params.id;
        Container.findById(containerId)
        .exec()
        .then(container => {
            console.log("Found container", container);
            if(container.creator.equals(req.user._id) || container.canEdit.includes(req.user._id)){
                Container.findByIdAndDelete(containerId).exec().then(doc => {
                    console.log("Container deleted:", doc)
                    res.status(200).json({message: "Container deleted"});
                }).catch(err => {
                    res.status(500).json({message: "Error deleting container:", err});
                })
            } else {
                res.status(403).json({message: "you don't have permission to edit this"});
            }
        }).catch(err => {
            res.status(500).json({message: "Error retrieving container:", err});
        })
    } else {
        res.status(401).json({message: "not logged in"});
    }
})

module.exports = containerRoutes;