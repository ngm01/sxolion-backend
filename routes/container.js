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
    if(req.body.items){
        createItems(req.body.items).then(newItems => {
            createContainer(req.body, newItems);
        })
    } else {
        createContainer(req.body, []);
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
        let {access, name, description, canEdit, canView, creator} = body;
        const newcContainer = new Container({
            access: access,
            canEdit: canEdit,
            canView: canView,
            creator: creator,
            description: description,
            name: name,
            items: items
        });
        newcContainer.save().then(result => {
            console.log("Created a new container:", result)
            res.status(201).json(result)
        })
    }
})

// GET: READ single container
containerRoutes.get('/:id', (req, res) => {
    let containerId = req.params.id;
    Container.findById(containerId)
    .then(doc => {
        if(doc){
            doc.populate('items').execPopulate().then(doc => {
                res.status(200).json(doc);
            })
        } else {
            res.status(404).json({message: "Container not found!"})
        }
    }).catch(err => {
        res.status(500).json({message: "Error retrieving container:", e})
    })
})

// GET: READ all of a user's containers
containerRoutes.get('/all/:id', (req, res) => {
    let userId = req.params.id;
    Container.find({creator: userId})
    .populate('items', 'creator', 'canView', 'canEdit')
    .execPopulate()
    .then(docs => {
        res.status(200).json(docs)
    }).catch(err => {
        res.status(500).json({message: "Error retrieiving user's containers:", err})
    })
})

// PUT: UPDATE a container
containerRoutes.put('/:id', (req, res) => {
    let _id = req.params.id;
    let {name, description, canEdit, canView, access, photos, items} = req.body;
    Container.findOneAndUpdate({_id: _id}, {
        name: name,
        description: description,
        canEdit: canEdit,
        canView: canView,
        access: access,
        photos: photos,
        items: items
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