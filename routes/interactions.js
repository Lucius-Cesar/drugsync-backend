const express = require('express');
const router = express.Router();
const {uniqueObjectArray} = require('../modules/utils')

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