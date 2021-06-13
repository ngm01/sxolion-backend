const express = require('express');
const Container = require('../models/Container');
const Item = require('../models/Item');



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
        Container.findById(containerId)
        .then(doc => {
            if(doc){
                if(doc.access === 'public' || doc.creator === req.user._id || doc.canView.includes(req.user.id)){
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
//  - on 'docs' below, filter for public vs private access
//      - if no public containers on a public acct, display "this user does not have any public containers" msg
//      - for private access containers, filter canView list for req.user._id
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
containerRoutes.put('/:id', (req, res) => {
    let _id = req.params.id;
    let {name, description, canEdit, canView, access, photos, tags} = req.body;
    Container.findOneAndUpdate({_id: _id}, {
        name: name,
        description: description,
        canEdit: canEdit,
        canView: canView,
        access: access,
        photos: photos,
        tags: tags
    }, {new: true}).exec().then(doc => {
        console.log("Updated container:", doc);
        res.status(200).json({message: "successfully updated container"});
    }).catch(err => {
        res.status(500).json({message: "Error updating container:", err});
    })
})

// DELETE: DELETE a container
containerRoutes.delete('/:id', (req, res) => {
    let _id = req.params.id;
    Container.findByIdAndDelete(_id).exec().then(doc => {
        console.log("Container deleted:", doc)
        res.status(200).json({message: "Container deleted"});
    }).catch(err => {
        res.status(500).json({message: "Error deleting container:", e});
    })
})

module.exports = containerRoutes;