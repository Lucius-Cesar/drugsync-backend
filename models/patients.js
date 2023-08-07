const mongoose = require('mongoose')

const patientSchema = mongoose.Schema({
    name : String,
    currentTreatment : [{ type: mongoose.Schema.Types.ObjectId, ref:'drugs'}],
})

const Patient = mongoose.model('patients', patientSchema)
module.exports = Patient