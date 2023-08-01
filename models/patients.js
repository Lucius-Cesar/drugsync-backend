const mongoose = require('mongoose')

const patientSchema = mongoose.Schema({

    name : String,
    treatment : [String],
    pathologies : [String]

})

const Patient = mongoose.model('patients',patientSchema)
module.exports = Patient