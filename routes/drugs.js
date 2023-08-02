var express = require('express');
var router = express.Router();
const Drug = require("../models/drugs")

// Helpers

// keep only unique element in an array
function unique(arr) {
    const uniqueSet = new Set(arr);
    return Array.from(uniqueSet);
}

async function getRxNavData(drug){
     // rxcui
     const rxcuiFetch = await fetch(`https://rxnav.nlm.nih.gov/REST/Prescribe/rxcui.json?name=${drug}`)
     const rxcuiResponse =  await rxcuiFetch.json()
     const rxcui = rxcuiResponse.idGroup.rxnormId ? rxcuiResponse.idGroup.rxnormId[0] : null

     if(!rxcui){
        return 
     }
     //rxNormName
     const rxNormFetch = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}.json`)
     const rxNormResponse = await rxNormFetch.json()
     const rxNorm = rxNormResponse.idGroup.name

     const rxNav = {
        rxcui: rxcui,
        rxNorm: rxNorm
     }
     return(rxNav)
}
async function getNewDrugData(drug){
    let chemblId
    let drugbankId
    const rxNav = await getRxNavData(drug)
    
    if(rxNav){
    const UnichemJsonRequest= {
        "type":"sourceID",
        "compound": `${rxNav.rxNorm}`,
        "sourceID": 47 //47 For RXnorm entry
    }

    unichemFetch = await fetch("https://www.ebi.ac.uk/unichem/api/v1/compounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(UnichemJsonRequest)
      })
    const unichemJson = await unichemFetch.json()
        // CHEMBLId
        const chemblObject = unichemJson.compounds[0] && unichemJson.compounds[0].sources.find(obj => obj.shortName === "chembl")
        chemblId = chemblObject ? chemblObject.compoundId : "";
        
        // drugbankId
        const drugbankObject = unichemJson.compounds[0] && unichemJson.compounds[0].sources.find(obj => obj.shortName === "drugbank")
        drugbankId = drugbankObject ? drugbankObject.compoundId : "";
    } 
    

    


    //CHEMBl API FETCH
    let chemblFetch = ""
    let chemblJson
    if(chemblId){ 
       chemblFetch = await fetch(`https://www.ebi.ac.uk/chembl/api/data/molecule/${chemblId}.json`)
       chemblJson = await chemblFetch.json()
    }
    else{ //if no link between rxNorm and Chembl try Chembl pref_name = drug 
        chemblFetch = await fetch(`https://www.ebi.ac.uk/chembl/api/data/molecule.json?pref_name__iexact=${drug}`)
        chemblJson = await chemblFetch.json()
        chemblJson = chemblJson.molecules[0]
        
    }
    if(!rxNav && !chemblJson){ // if no rxnorm et no data entry return nothing
        return
    }
    chemblSynonyms = chemblJson.molecule_synonyms ? chemblJson.molecule_synonyms : null
    
    fdaName = chemblSynonyms ? chemblSynonyms.find(item => item.syn_type === "FDA").molecule_synonym : null
    const drugData = {
        name: fdaName ? fdaName : rxNav.rxNorm,
        rxNav: [{
            rxcui: rxNav.rxcui, // Handle multiple rxNorm per molecule will be done later
            rxNorm: rxNav.rxNorm
        }],
        chemblId: chemblJson.molecule_chembl_id ? chemblJson.molecule_chembl_id : "",
        synonyms: chemblSynonyms ? unique(chemblSynonyms.filter(synonym => (synonym.syn_type !== "TRADE_NAME")).map(item => item.molecule_synonym))  : [],
        tradeNames: chemblSynonyms ? unique(chemblSynonyms.filter(synonym => (synonym.syn_type === "TRADE_NAME")).map(item => item.molecule_synonym)) : [],
        drugbank: drugbankId ? drugbankId: "",
        DDinter: "" // empty for the moment
    }
    return(drugData )
}


//Routes
router.post('/', async function(req, res, next) {
    drugPattern =  new RegExp(req.body.drug, 'i')

    //find by Rxnorm Name
    Drug.findOne({
        'rxNav.rxNorm' : { $regex: drugPattern } 
        })
        .then(
            drugFoundInDb => {
                if(drugFoundInDb){ // if drug rxNorm is already registred
                    res.json({result: true, drugData: drugFoundInDb})
                }
                else{ //else check if the drug name is in synonyms fields
                    const query = {
                        $or: [
                            {name : { $regex: drugPattern }},
                            { synonyms: { $elemMatch: { $regex: drugPattern } } },
                            { tradeNames: { $elemMatch: { $regex: drugPattern } } }
                        ],
                      };
                    Drug.findOne(query)
                    .then(drugFoundInDb => {
                        if(drugFoundInDb){
                        res.json({result: true, drugData: drugFoundInDb})
                        }
                        else{ // if not in synonyms get new drug Info
                            getNewDrugData(req.body.drug)
                            .then(
                                newDrug =>{
                                if(newDrug){
                                    Drug.create(newDrug)
                                    res.json({result: true, drugData: newDrug})
                                }
                                else{
                                    res.json({result: false, error: "Molecule not found, try synonym"})
                                }
                            }
                            )
                        }
                    })
                }
            }
        )
  })

  module.exports = router;
