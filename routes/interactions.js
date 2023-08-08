const express = require('express');
const router = express.Router();
const {uniqueObjectArray} = require('../modules/utils')
const Drug = require("../models/drugs");
const urlFirstPart = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=`
const severity = ['unknown', 'minor', 'moderate', 'major']


//Route to check interactions inside current treatment + interactions with the treatment and the searched molecule
router.get('/:currentTreatment/:searched', (req, res) => {
    fetch(`${urlFirstPart}${req.params.currentTreatment}+${req.params.searched}&sources=drugbank`)
      .then(response => response.json())
      .then(data => {
        let currentTreatmentInteractions = [];
        let searchedInteractions = [];


        for (const group of data.fullInteractionTypeGroup) {
          for (const interactionType of group.fullInteractionType) {
            const isSearchedInteraction = interactionType.minConcept[0].rxcui === req.params.searched || 
              interactionType.minConcept[1].rxcui === req.params.searched ? true : false
            for (const interactionPair of interactionType.interactionPair) {
              const drugA = interactionPair.interactionConcept[0].sourceConceptItem.name;
              const drugB = interactionPair.interactionConcept[1].sourceConceptItem.name;
              const description = interactionPair.description;
              let interaction = { drugA, drugB, description}

              isSearchedInteraction ? searchedInteractions.push(interaction) : currentTreatmentInteractions.push(interaction);  
            }
          }
        }
        //duplicated entries, no time to investigate why -> unique()
        //later : buy API or use DDinter data. Currently we use random severity 
        currentTreatmentInteractions = uniqueObjectArray(currentTreatmentInteractions).map(
          interaction => {
            const randomSeverityIndex = Math.floor(Math.random() * severity.length);
            interaction.severity = severity[randomSeverityIndex]
            return interaction
          }
        )
        searchedInteractions = uniqueObjectArray(searchedInteractions).map(
          interaction => {
            const randomSeverityIndex = Math.floor(Math.random() * severity.length);
            interaction.severity = severity[randomSeverityIndex]
            return interaction
          }
          
        )
        res.json({ result: true, currentTreatmentInteractions, searchedInteractions});
      })
  });

//Route to interactions inside current treatment
router.get('/:currentTreatment', (req, res) => {
  fetch(`${urlFirstPart}${req.params.currentTreatment}&sources=drugbank`)
    .then(response => response.json())
    .then(data => {
      let currentTreatmentInteractions = [];
      for (const group of data.fullInteractionTypeGroup) {
        for (const interactionType of group.fullInteractionType) {
          for (const interactionPair of interactionType.interactionPair) {
            const drugA = interactionPair.interactionConcept[0].sourceConceptItem.name;
            const drugB = interactionPair.interactionConcept[1].sourceConceptItem.name;
            const description = interactionPair.description;
            let interaction = { drugA, drugB, description}

            currentTreatmentInteractions.push(interaction);  
          }
        }
      }
      //duplicated entries, no time to investigate why -> unique()
      //later : buy API or use DDinter data. Currently we use random severity 
      currentTreatmentInteractions = uniqueObjectArray(currentTreatmentInteractions).map(
        interaction => {
          const randomSeverityIndex = Math.floor(Math.random() * severity.length);
          interaction.severity = severity[randomSeverityIndex]
          return interaction
        }
      )
      res.json({ result: true, currentTreatmentInteractions});
    })
});

module.exports = router;

//faire en sorte que ca trouve tout les interationPair pour ensuite ajouter les drugname

/*router.post("/interactions", (req, res) => {
  for(let i=0; i < body.currentTreatment.length-1; i++){
    let drugA = currentTreatment.length[i]
    drugA.synonyms = drugA.map(synonym => new Regexp(synonym, "i"))

    for(let i =0; i < body.currentTreatment.length-1; i++){
      let drugB = currentTreatment.length[i+1]
      drugB.synonyms = drugB.map(synonym => new Regexp(synonym, "i"))
      let query = {$and: [
        {
          $or: [
            { drugsPair: { $elemMatch: { $regex: new RegExp(drugA.name, "i") } } },
            { drugsPair: { $in: drugA.synonyms } },
          ],
        },
        {
          $or: [
            { drugsPair: { $elemMatch: { $regex: new RegExp(drugB.name, "i") } } },
            { drugsPair: { $in: drugB.synonyms } },
          ],
        },]}
        Drug.updateOne(query, {drugsPair:[drugA.name, drugB.name]})
        .then( updateData =>{
            if(updateData.modifiedCount > 0){
              
          }
        })

    }
  }
})

*/