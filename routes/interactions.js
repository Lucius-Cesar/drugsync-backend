const express = require('express');
const router = express.Router();

const rxcui = [207106,152923,656659]
const rxcuiJoin = rxcui.join('+')
const urlFirstPart = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=`
const severity = ['unknown', 'minor', 'moderate', 'major']
router.get('/', (req, res) => {
    fetch(`${urlFirstPart}${rxcuiJoin}`)
      .then(response => response.json())
      .then(data => {
        const interactions = [];
        for (const group of data.fullInteractionTypeGroup) {
          for (const interactionType of group.fullInteractionType) {
            for (const interactionPair of interactionType.interactionPair) {
              const drugA = interactionPair.interactionConcept[0].sourceConceptItem.name;
              const drugB = interactionPair.interactionConcept[1].sourceConceptItem.name;
              const description = interactionPair.description;
              const randomSeverity = Math.floor(Math.random() * severity.length);
              interactions.push({ drugA, drugB, description, severity: severity[randomSeverity]  });
            }
          }
        }
  
        res.json({ result: true, interactions});
      })
  });

module.exports = router;

//faire en sorte que ca trouve tout les interationPair pour ensuite ajouter les drugname