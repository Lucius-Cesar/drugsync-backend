var express = require("express");
const { checkBody } = require("../modules/checkBody");
var router = express.Router();
const Patient = require("../models/patients");
const Drug = require("../models/drugs");


router.post("/", (req,res) => {
    if (
        !checkBody(req.body,[
            "name",
            "currentTreatment",
        ])
    ){
        res.json({ result : false, error: "Missing , empty or incorrect field"})
        return;
    }
    //Check if patient is already registered

    Patient.find({ name: {$regex: new RegExp(req.body.name , "i")} })
    .then((data) => { 
        let nbr
        if(data){
        nbr = data.length +1
    }
    else{
        nbr = 1
    }


// grâce à req.body.currentTreatment récupérer les id des médocs contenus dans le tab
    const currentTreatment = req.body.currentTreatment
// Drugs.find() doit renvoyer les documents des médocs ,
    Drug.find({
        name: { $in: currentTreatment}
    }).then( drugs => {
// Créer un tableau d'IDs de médicaments à partir des médicaments récupérés
    const drugIds = drugs.map(drug => drug._id)

        const newPatient = new Patient({
            name: req.body.name + nbr,
            currentTreatment : drugIds
        }) 
        
        newPatient.save().then((newDoc)=>{
            res.json({result : true, newDoc})
        })
        })

    })

    })


    module.exports = router;
