const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: {type: String},
    description: {type: String},
    // strings are urls -- links to cloud storage somewhere (cloudinary?)
    photos: [String]
}, {timestamps: true})

const Item  = mongoose.model('Item', ItemSchema);
module.exports = Item;