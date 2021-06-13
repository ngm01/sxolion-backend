const express = require('express');
const Item = require('../models/Item');

const itemRoutes = express.Router();

itemRoutes.delete('/:id', (req, res) => {
    let itemId = req.params.id;
    Item.findByIdAndDelete(itemId)
    .then(doc => {
        if(doc){
            res.status(200).json({message: "item deleted"})
        } else {
            res.status(404).json({message: "item not found"})
        }
    }).catch(err => {
        res.status(500).json({message: "error attempting to delete item:", err});
    })
})

module.exports = itemRoutes;