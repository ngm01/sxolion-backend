const mongoose = require('mongoose');
const Item = require('./Item');


const ContainerSchema = new mongoose.Schema({
    name: {type: String},
    description: {type: String},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
    photos: [String],
    /**
     * access types:
     * - public: anyone can view
     * - private: only creator can view
     * - restricted: only those with access can view
     */
    access: {type: String, default: 'public'},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    canView: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    canEdit: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    tags: [String]
    
}, {timestamps: true})

const Container = mongoose.model('Container', ContainerSchema);
module.exports = Container;