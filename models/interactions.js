const mongoose = require('mongoose')

const interactionSchema = mongoose.Schema({
    inter: Number,
    drugsPair: [String],
    DDinterPair: [String],
    severity: String,
    mechanism: String,
    description: String,
    management: String,
    })

const Interaction = mongoose.model('interactions',interactionSchema)
module.exports = Interaction