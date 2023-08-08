const mongoose = require('mongoose')

const rxNavSchema = mongoose.Schema({
    rxNorm: String,
    rxcui: String
  });

const drugSchema = mongoose.Schema({
    name:  { type: String, unique: true },
    rxNav: [rxNavSchema],
    chemblId: String,
    synonyms: [String],
    tradeNames: [String],
    drugbank: String,
        DDinter: String 
})

const Drug = mongoose.model('drugs',drugSchema)
module.exports = Drug