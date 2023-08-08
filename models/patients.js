const mongoose = require('mongoose')

const patientSchema = mongoose.Schema({
    name : String,
    currentTreatment : [{ type: mongoose.Schema.Types.ObjectId, ref:'drugs'}],
    pathologies: [String],
})

const Patient = mongoose.model('patients', patientSchema)
module.exports = Patient