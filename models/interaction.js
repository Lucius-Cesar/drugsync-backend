const mongoose = require('mongoose')

const interactionSchema = mongoose.Schema({

    drugA : String,
    drugB : String,
    severity : String

})

const Interaction = mongoose.model('interactions',interactionSchema)
module.exports = Interaction