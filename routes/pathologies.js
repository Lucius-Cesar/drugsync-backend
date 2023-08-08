const express = require('express');
const router = express.Router();
const {uniqueObjectArray, capitalizeFirstLetter} = require("../modules/utils");
const { checkBody } = require('../modules/checkBody');

router.get('/:pathology', (req, res) => {
    url = `https://www.ebi.ac.uk/chembl/api/data/drug_indication.json?efo_term__icontains=${req.params.pathology}&limit=999$offset=0s&max_phase_for_ind=4`
    fetch(url)
    .then(response => response.json())
    .then(data =>
        {
            if(data.total_count !== 0){
                let pathologies = data.drug_indications.map(
                    e => {
                       return({
                        efo_term: e.efo_term,
                        efo_id: e.efo_id})
                    }
                )
                pathologies = uniqueObjectArray(pathologies)

                drugIndications = pathologies.map((pathology, i) =>
                {
                    chemblIds = []
                    const drugIndicationsForPathology = data.drug_indications.filter(element => 
                        element.efo_term === pathology.efo_term)
                    drugIndicationsForPathology.forEach(
                        item => chemblIds.push(item.molecule_chembl_id)  
                    )     
                    return({
                        efo_term: pathology.efo_term,
                        efo_id : pathology.efo_id,
                        chemblIds: chemblIds
                    })
                    
                }
                )
                res.json({result:true, drugIndications})
            }
            else {
                res.json({result: false, error: `No pathology found for ${req.body.pathology}, please try a synonym`})
            }

        }
        )
})

router.post('/treatmentSuggestions', (req, res) => {
    if(!checkBody(req.body, ["efo_term", "efo_id", "chemblIds"])){
        res.json({result: false, error: "Empty or Incorrect fields"})
    }
    else{
        const chemblIdsString = req.body.chemblIds.join(",")
        const url = `https://www.ebi.ac.uk/chembl/api/data/molecule.json?molecule_chembl_id__in=${chemblIdsString}`
        fetch(url)
        .then(response => response.json())
        .then(data => {
            const drugs =  data.molecules.map(molecule => capitalizeFirstLetter(molecule.pref_name))
            treatmentSuggestions = {
                efo_term: req.body.efo_term,
                efo_id: req.body.efo_id,
                drugs: drugs
            }
            res.json({result: true, treatmentSuggestions})
        })
    }
})
module.exports = router;
