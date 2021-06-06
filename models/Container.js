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
     * - private: only createdBy can view
     * - restricted: only those with access can view
     */
    access: {type: String, default: 'private'},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    canView: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    canEdit: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
    
}, {timestamps: true})

const Container = mongoose.model('Container', ContainerSchema);
module.exports = Container;