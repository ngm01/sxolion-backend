const express = require('express');
const Container = require('../models/Container');
const Item = require('../models/Item');



const containerRoutes = express.Router();

// POST: create a new container
containerRoutes.post('', (req, res)=> {
    // create items
    if(items){
        createItems(items).then(newItems => {
            createContainer(req.body, newItems);
        })
    } else {
        createContainer(req.body, []);
    }

    const createItems = async function(items){
        let dbItems = [];
        for(let i in items){
            let newItem = new Item({
                name: i.name,
                description: i.description,
                photos: i.photos
            });
            await newItem.save().then(result => {
                dbItems.push(result);
            })
        }
        return dbItems;
    }

    const createContainer = function(body, items){
        let {access, title, description, canEdit, canView, creator} = body;
    }
})

// GET: a single container
containerRoutes.get('/:id', (req, res)=> {
    let containerId = req.params.id;
    Container.findById(containerId).populate('items', 'createdBy', 'canView', 'canEdit').execPopulate().then(doc => {
        if(doc){
            res.status(200).json(doc);
        } else {
            res.status(404).json({message: "Container not found!"})
        }
    }).catch(err => {
        res.status(500).json({message: "Error retrieving container:", e})
    })
})

// GET: all of a user's containers
containerRoutes.get('/all/:id', (req, res)=> {

})

